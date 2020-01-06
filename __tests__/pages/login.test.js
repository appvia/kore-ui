import { shallow } from 'enzyme'
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
  it('shows login for auth provider', () => {
    const app = shallow(<Login authProvider={authProvider} connectorId="default-myprovider" />)

    expect(app.find('Card').prop('title')).toEqual('Login')
    expect(app.find('Button a').prop('href')).toEqual('/login/auth?provider=default-myprovider')
    expect(app.find('Button a').text()).toEqual(`Login with ${authProvider.spec.displayName}`)
  })
})

describe('Snapshot testing', () => {
  it('shows login', () => {
    const component = renderer.create(<Login authProvider={authProvider} connectorId="default-myprovider" />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})