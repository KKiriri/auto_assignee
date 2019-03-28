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
    const UpdatedEarlierThan = this.since(1)
    this.logger.info('will add label to issues updated earlier than '+UpdatedEarlierThan)
    // find updated time is before certain amount of days, then check if updated_time is created_time
    var q = `repo:${owner}/${repo} is:issue is:open  updated:<=${UpdatedEarlierThan} label:"Customer Reported" no:assignee`
    this.logger.info(q)
    const params = {q, sort: 'updated', order: 'desc', per_page: 100}

    const issues = await this.github.search.issues(params)

    if (issues.data.total_count===0) {
      this.logger.info('no issue found')
    }
    else{
      for (var i in issues.data.items){
        var squad_leaders=this.find_leader(issues.data.items[i])
      }
    this.logger.info('issue created and updated time: '+ `${issues.data.items[0].created_at} + ${issues.data.items[0].updated_at}`)
    }

    //issue => this.addlable(this.context.repo({number: issue.number}))
    return //this.issuelocate(q)//neverRepliedArray.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
  }

async find_leader(issue){
  var squad_exists=false
  for (var i in issue.labels){
    if(issue.labels[i].name.substring(0, 5)=='squad'){
      await this.lookupLeader(issue.labels[i].name,issue.number)
      squad_exists=true
    }
  }
  if(squad_exists=false){
    const {owner, repo} = this.context.repo()
    return this.github.issues.addAssignees({owner, repo, number:issue.number, assignees:`xdong`})
  }
    return
}

async lookupLeader(squad_name,iss_number){
  const {owner, repo} = this.context.repo()
  var leader_name= new axios.get('http://icpweb.platformlab.ibm.com/roadmap/api/squads/')
      .then (response => {
  	let filtered_squads = response.data.results.filter( squad => squad.label.name === squad_name)
          if (filtered_squads.length === 1) {
  		var squad =  filtered_squads[0]
         		this.logger.info(squad.lead)

            let assignee=squad.lead.login

            this.logger.info(`adding assignees`)

            fs.appendFile('output_test.txt',`\n Assignee ${squad.lead} is added to issue #${iss_number}` + ' \n', (err) => {
              // throws an error, you could also catch it here
              if (err) throw err
              // success case, the file was saved
              this.logger.info('output to file succesed \n')
            }
          )

            return this.github.issues.addAssignees({owner, repo, iss_number, assignees:assignee})

  	} else {
  		this.logger.info('lead not assigned yet')
  	}
      })
      .catch(error => {
          console.log(error)
      })

      return
}



since (days) {
  const ttl = days * 24 * 60 * 60 * 1000
  var ISOwithouttimer = (new Date(new Date() - ttl)).toISOString().substring(0, 19);
  return ISOwithouttimer
}
}
