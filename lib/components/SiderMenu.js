import Link from 'next/link'
import PropTypes from 'prop-types'
import { Layout, Menu, Icon } from 'antd'
const { Sider } = Layout
const { SubMenu } = Menu

class SiderMenu extends React.Component {
  static propTypes = {
    hide: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    userTeams: PropTypes.array.isRequired
  }

  state = {
    siderCollapsed: false
  }

  onSiderCollapse = siderCollapsed => {
    this.setState({
      siderCollapsed
    })
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const menuItem = ({ key, text, href, link, icon }) => (
      <Menu.Item key={key} style={{margin: '0'}}>
        <Link href={href || link} as={link}>
          <a className="collapsed"><Icon type={icon} />{text}</a>
        </Link>
      </Menu.Item>
    )

    const AdminMenu = () => this.props.isAdmin ? (
      <SubMenu key="configure"
        title={
          <span>
            <Icon type="tool" />
            <span>Configure</span>
          </span>
        }
      >
        {menuItem({ key: 'configure_integrations', text: 'Integrations', link: '/configure/integrations', icon: 'api' })}
        {menuItem({ key: 'users', text: 'Users', link: '/configure/users', icon: 'user' })}
      </SubMenu>
    ) : null

    return (
      <Sider
        collapsible
        collapsed={this.state.siderCollapsed}
        onCollapse={this.onSiderCollapse}
        width="235"
      >
        <Menu defaultOpenKeys={['configure', 'teams', 'spaces']}  mode="inline">
          <SubMenu key="teams"
            title={
              <span>
                <Icon type="team" />
                <span>Teams</span>
              </span>
            }
          >
            {menuItem({ key: 'new_team', text: 'New team', link: '/teams/new', icon: 'plus-circle' })}
            {(this.props.userTeams || []).map(t => (
              menuItem({ key: t.metadata.name, text: t.spec.summary, href: '/teams/[name]', link: `/teams/${t.metadata.name}`, icon: 'team' })
            ))}
          </SubMenu>
          {AdminMenu()}
        </Menu>
      </Sider>
    )
  }
}

export default SiderMenu
