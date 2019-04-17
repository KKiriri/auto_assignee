const scramjet = require('scramjet')
const fs = require('fs');
const axios=require ('axios')

module.exports = class icpbot{
  constructor (context, config, logger) {
    this.context = context//repository info
    this.github = context.github
    this.config = config//yml file's content
    this.logger = logger
  }

  async sweep () {
    this.logger.debug('Starting sweep')
    const Labelissues =await this.getrequiredIssues()
  }

  async getrequiredIssues () {
    const {owner, repo} = this.context.repo()
    const {tagComment} = this.config
    var versions = ['3.2.0', '3.1.2.0', '3.1.1.0']
    // find updated time is before certain amount of days, then check if updated_time is created_time
    var q = `repo:${owner}/${repo} is:issue is:open label:"Customer Reported" no:assignee`
    //q for auto_assignee function
    var q2= `repo:${owner}/${repo} is:issue label:"Customer Reported" label:"L3: coding bug" `
    //q2 for automation test function
    for (var i in versions){
      var eachversion='label:'+versions[i]+' '
      var issueslookingfor=q2+eachversion
      this.logger.info(issueslookingfor)
      this.testauto(issueslookingfor)
    }

    const params = {q, sort: 'updated', order: 'desc', per_page: 100}
    const issues = await this.github.search.issues(params)

    if (issues.data.total_count===0) {
      this.logger.info('no issue found')
    }
    else{
      for (var i in issues.data.items){
        if(await this.squadlabelexists(issues.data.items[i])==true){
          this.logger.info(`adding assignees`)
          var squad_leaders=this.find_leader(issues.data.items[i])
        }
      }
    this.logger.info('issue created and updated time: '+ `${issues.data.items[0].created_at} + ${issues.data.items[0].updated_at}`)
    }
    return
  }

async testauto(q){
  const {owner, repo} = this.context.repo()
  const params = {q, sort: 'updated', order: 'desc', per_page: 100}
  const issues = await this.github.search.issues(params)
  this.logger.info(issues.data.items.length)
  var recordedtest = fs.readFileSync('added_number.txt').toString().split("\n")

  for (var i = 0; i < issues.data.items.length; i++){
    var testexists=0
  const title='[Test Automation] '+`${issues.data.items[i].title} `+ `${issues.data.items[i].number}`
    for (var j in recordedtest){

      if (issues.data.items[i].number==recordedtest[j]){
        testexists=1
      }
    }
    if (testexists==0){
      var labelsneeded=["task","L3: Dev Test Automation"]
      const map1 = issues.data.items[i].labels.map(x => {if(x.name.substring(6, 9)!='doc'&&x.name.substring(0,5)=='squad')labelsneeded.push(x.name)})

    console.log(labelsneeded)
      this.logger.info('will create auto testing for issue number'+`${issues.data.items[i].number}`)
      fs.appendFile('added_number.txt',`${issues.data.items[i].number}` + '\n', (err) => {
        if (err) throw err
        }
      )
      this.logger.info('the ticket '+ `${issues.data.items[i].number}` +' is recorded \n')
      this.github.issues.create({owner, repo, title, body: `Squad, please help create the automated test cases for the fix to the customer reported issue #` +`${issues.data.items[i].number}`+
        ` Please close the issue and link to the PR if you have already added test coverage. thanks.`, labels: labelsneeded }).then(result => {this.logger.info(result)})
    }



  }
}


async squadlabelexists(issue){
  const UpdatedEarlierThan = this.since(1)
  const {owner, repo} = this.context.repo()
  const events= await this.github.issues.listEvents({owner, repo, number:issue.number})
  // this.logger.info(events)
  for (var i in events.data){
    if(events.data[i].event==`labeled`){
      if(events.data[i].label.name.substring(0,5)==`squad`){
        this.logger.info(UpdatedEarlierThan+`    `+events.data[i].created_at)
        if(UpdatedEarlierThan>events.data[i].created_at){
          this.logger.info(`squad label added after 24h found`)
          return true
        }
      }
    }
  }
  return false
}

async find_leader(issue){
  const {owner, repo} = this.context.repo()
  var squads_number=0
  var atleaders=''
  for (var i in issue.labels){
    if(issue.labels[i].name.substring(0, 5)=='squad'){
      var assignee=await this.LookupLeader(issue.labels[i].name,issue.number)
      this.logger.info(assignee)
      if(squads_number<10){
        this.github.issues.addAssignees({owner, repo, number:issue.number, assignees:assignee})
        fs.appendFile('output_test.txt',`\n Assignee ${assignee} is added to issue #${issue.number}` + ' \n', (err) => {
          // throws an error, you could also catch it here
          if (err) throw err
          // success case, the file was saved
          this.logger.info('output to file succesed \n')
        }
      )
        squads_number+=1
      }
      else{
        var atperson='@'+assignee+' \n '
        atleaders+=atperson
        squads_number+=1
      }
    }
  }
  if(atleaders!=''){
     atleaders += 'Above Squad leaders are mentioned because the number of assignee reached maximum number. \n Please respond to the content of this ticket \n'
    await this.github.issues.createComment({owner, repo, number:issue.number, body:atleaders})
  }
  if(squads_number=0){
    const {owner, repo} = this.context.repo()
    return this.github.issues.addAssignees({owner, repo, number:issue.number, assignees:`xdong`})
  }
    return
}


async LookupLeader(squad_name,iss_number){
  var leader_name= new axios.get('http://icpweb.platformlab.ibm.com/roadmap/api/squads/')
      .then (response => {
  	     let filtered_squads = response.data.results.filter( squad => squad.label.name === squad_name)
          if (filtered_squads.length === 1) {
  		        var squad =  filtered_squads[0]
         		   //this.logger.info(squad.lead)
              var assignee=squad.lead.login
              //this.logger.info(assignee)
              return assignee//this.github.issues.addAssignees({owner, repo, number:iss_number, assignees:assignee})
  	} else {
  		this.logger.info('lead not assigned yet')
  	}
      })
      .catch(error => {
          console.log(error)
      })
      return leader_name
}



since (days) {
  const ttl = days * 24 * 60 * 60 * 1000
  var ISOwithouttimer = (new Date(new Date() - ttl)).toISOString().substring(0, 19);
  return ISOwithouttimer
}
}
