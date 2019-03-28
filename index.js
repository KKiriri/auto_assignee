const Icpbot = require('./lib/addassignee')
const createScheduler = require('probot-scheduler')
const getConfig = require('probot-config')

module.exports =async robot => {
  const scheduler= createScheduler(robot)
  robot.log('Yay, the app was loaded!')
  robot.on('schedule.repository', addlable)

  async function addlable (context) {



      const configWithDefaults = Object.assign({}, require('./lib/defaults'))
      //console.log(configWithDefaults)
      const bot = new Icpbot(context, configWithDefaults, robot.log)
      return bot.sweep()
    
  }
}
