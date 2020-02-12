import { mount } from 'enzyme'
import renderer from 'react-test-renderer'

import Login from '../../pages/login'

const authProvider = {
  metadata: {
    name: 'default'
  },
  spec: {
    displayName: 'My Provider',
    config: {
      myprovider: {}
    }
  }
}

describe('Login', () => {
  it('shows login for auth provider, using embedded auth', () => {
    const app = mount(<Login authProvider={authProvider} connectorId="default-myprovider" embeddedAuth={true} />)

    expect(app.find('Card').prop('title')).toEqual('Login')
    expect(app.find('Button a').prop('href')).toEqual('/login/auth?provider=default-myprovider')
    expect(app.find('Button a').text()).toEqual(`Login with ${authProvider.spec.displayName}`)
  })

  it('shows login for openid identity provider, not using embedded auth', () => {
    const app = mount(<Login embeddedAuth={false} />)

    expect(app.find('Card').prop('title')).toEqual('Login')
    expect(app.find('Button a').prop('href')).toEqual('/login/auth')
    expect(app.find('Button a').text()).toEqual('Login with Identity Provider')
  })
})

describe('Snapshot testing', () => {
  it('shows login using embedded auth', () => {
    const component = renderer.create(<Login authProvider={authProvider} connectorId="default-myprovider" embeddedAuth={true} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })

  it('shows login not using embedded auth', () => {
    const component = renderer.create(<Login embeddedAuth={false} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})
