module.exports = (team, username) => ({
  apiVersion: 'org.hub.appvia.io/v1',
  kind: 'TeamMembership',
  metadata: {
    name: username
  },
  spec: {
    team,
    username
  }
})
