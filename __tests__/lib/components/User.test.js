import { mount } from 'enzyme'
import renderer from 'react-test-renderer'

import User from '../../../lib/components/User'

describe('User', () => {
  let user

  beforeEach(() => {
    user = {
      preferred_username: 'jbloggs',
      name: 'Joe Bloggs',
      isAdmin: true
    }
  })

  it('renders nothing when there is no user', () => {
    user = null
    const userComponent = mount(<User user={user} />)
    expect(userComponent.isEmptyRender()).toBe(true)
  })

  it('displays username and admin tag', () => {
    const userComponent = mount(<User user={user} />)
    expect(userComponent.find('Text.user-displayName').text()).toEqual('Joe Bloggs')
    expect(userComponent.find('Tag.user-admin').text()).toEqual('admin')
  })

  it('does not show admin tag unless user is an admin', () => {
    user.isAdmin = false
    const userComponent = mount(<User user={user} />)
    expect(userComponent.find('Tag.user-admin')).toHaveLength(0)
  })
})

describe('Snapshot testing', () => {
  let user

  beforeEach(() => {
    user = {
      preferred_username: 'jbloggs',
      name: 'Joe Bloggs',
      isAdmin: true
    }
  })

  it('shows admin user details', () => {
    const component = renderer.create(<User user={user} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows non-admin user details', () => {
    user.isAdmin = false
    const component = renderer.create(<User user={user} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})