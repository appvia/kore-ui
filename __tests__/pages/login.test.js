import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'

import Login from '../../pages/login'

const authProvider = {
  id: 'my-provider',
  metadata: {
    name: 'my-provider'
  },
  spec: {
    displayName: 'My Provider'
  }
}

describe('Login', () => {
  it('shows login for auth provider', () => {
    const app = shallow(<Login authProvider={authProvider} />)

    expect(app.find('Card').prop('title')).toEqual('Login')
    expect(app.find('Button a').prop('href')).toEqual(`/login/${authProvider.metadata.name}`)
    expect(app.find('Button a').text()).toEqual(`Login with ${authProvider.spec.displayName}`)
  })
})

describe('Snapshot testing', () => {
  it('shows login', () => {
    const component = renderer.create(<Login authProvider={authProvider} />)
    const tree = component.toJSON()
    expect(tree).toMatchSnapshot()
  })
})