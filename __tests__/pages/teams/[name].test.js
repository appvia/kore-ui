import { when } from 'jest-when'
import { mount } from 'enzyme'

import TeamPage from '../../../pages/teams/[name]'
import apiRequest from '../../../lib/utils/api-request'
import copy from '../../../lib/utils/object-copy'

jest.mock('../../../lib/utils/api-request')

const props = {
  user: { id: 'jbloggs' },
  team: {
    metadata: { name: 'a-team' },
    spec: { summary: 'A Team' }
  },
  members: { items: ['jbloggs', 'fflintstone'] },
  clusters: { items: [] },
  namespaceClaims: { items: [] },
  available: { items: [] }
}

describe('TeamPage', () => {
  const userObj = (username) => ({
    metadata: { name: username },
    spec: { username }
  })

  let teamPage
  let wrapper

  beforeEach(() => {
    apiRequest.mockClear()
    when(apiRequest).calledWith(null, 'get', '/users').mockReturnValue({ items: [userObj('one'), userObj('two'), userObj('admin'), userObj('three')] })
    wrapper = mount(<TeamPage {...props} />)
    teamPage = wrapper.instance()
  })

  describe('instance methods', () => {

    describe('#constructor', () => {
      it('sets props on state', () => {
        expect(teamPage.state.members).toEqual(props.members)
        expect(teamPage.state.clusters).toEqual(props.clusters)
        expect(teamPage.state.namespaceClaims).toEqual(props.namespaceClaims)
        expect(teamPage.state.createNamespace).toEqual(false)
      })
    })

    describe('#getAllUsers', () => {
      beforeEach(() => {
        apiRequest.mockClear()
      })

      it('return array of usernames without admin', async () => {
        apiRequest.mockResolvedValue({ items: [userObj('one'), userObj('two'), userObj('admin'), userObj('three')] })
        const allUsers = await teamPage.getAllUsers()
        expect(allUsers).toEqual(['one', 'two', 'three'])
      })

      it('returns empty array if no users', async () => {
        apiRequest.mockResolvedValue({})
        const allUsers = await teamPage.getAllUsers()
        expect(allUsers).toEqual([])
      })
    })

    describe('#componentDidMount', () => {
      beforeEach(() => {
        apiRequest.mockClear()
      })

      it('sets all users on state', async () => {
        apiRequest.mockResolvedValue({ items: [userObj('one'), userObj('two'), userObj('admin'), userObj('three')] })
        const expectedState = copy(teamPage.state)
        await teamPage.componentDidMount()
        expectedState.allUsers = ['one', 'two', 'three']
        expect(teamPage.state).toEqual(expectedState)
      })
    })

    describe('#addTeamMembersUpdated', () => {
      it('sets members updated to the state', () => {
        const members = ['one', 'two']
        const expectedState = copy(teamPage.state)
        expectedState.membersToAdd = members
        teamPage.addTeamMembersUpdated(members)
        expect(teamPage.state).toEqual(expectedState)
      })
    })

    describe('#addTeamMembers', () => {
      beforeEach(() => {
        apiRequest.mockClear()
      })

      it('makes api request to add each member', async () => {
        apiRequest.mockResolvedValue({})
        teamPage.state.membersToAdd = ['one', 'two']
        await teamPage.addTeamMembers()

        expect(apiRequest).toHaveBeenCalledTimes(2)
        expect(apiRequest.mock.calls[0]).toEqual([ null, 'put', '/teams/a-team/members/one' ])
        expect(apiRequest.mock.calls[1]).toEqual([ null, 'put', '/teams/a-team/members/two' ])
      })

      it('adds new team members to the team members list in the state', async () => {
        apiRequest.mockResolvedValue({})
        teamPage.state.membersToAdd = ['one', 'two']
        await teamPage.addTeamMembers()

        expect(teamPage.state.members.items).toEqual(['jbloggs', 'fflintstone', 'one', 'two'])
      })
    })

    describe('#deleteTeamMember', () => {
      beforeEach(() => {
        apiRequest.mockClear()
      })

      it('makes api request to add each member', async () => {
        apiRequest.mockResolvedValue({})
        await teamPage.deleteTeamMember('fflintstone')()

        expect(apiRequest).toHaveBeenCalledTimes(1)
        expect(apiRequest.mock.calls[0]).toEqual([ null, 'delete', '/teams/a-team/members/fflintstone' ])
      })

      it('removes member from the team members list in the state', async () => {
        apiRequest.mockResolvedValue({})
        await teamPage.deleteTeamMember('fflintstone')()

        expect(teamPage.state.members.items).toEqual(['jbloggs'])
      })
    })
  })

})
