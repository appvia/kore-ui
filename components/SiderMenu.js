import Link from "next/link"
import { Layout, Typography, Menu, Icon } from 'antd'
const { Sider } = Layout
const { Paragraph } = Typography

class SiderMenu extends React.Component {
  state = {
    siderCollapsed: false,
    menuTitleFontSize: '15px'
  }

  onSiderCollapse = siderCollapsed => {
    this.setState({
      siderCollapsed,
      menuTitleFontSize: this.state.siderCollapsed ? '15px' : '10px'
    })
  }

  render() {
    if (this.props.hide) {
      return null
    }

    const menuItem = ({ key, text, link, icon }) => (
      <Menu.Item key={key} style={{margin: '0'}}>
        { this.state.siderCollapsed ?
          <Link href="/teams/new">
            <div>
              <Icon type={icon} />
              <span><a className="collapsed">{text}</a></span>
            </div>
          </Link> :
          <Link href={link}>
            <span>
              <a className="expanded">
                <Icon type={icon} />{text}
              </a>
            </span>
          </Link>
        }
        <style jsx>{`
        a.expanded {
          color: #595959;
          display: inline-block;
          width: 100%;
        }
        a.expanded:hover {
          color: #1890ff;
        }
        a.collapsed {
          color: #FFF;
        }
      `}</style>
      </Menu.Item>
    )

    const AdminMenu = () => this.props.isAdmin ? (
      <div>
        <Paragraph
          strong
          style={{marginTop: '15px', marginBottom: '5px', textAlign: 'center', fontSize: this.state.menuTitleFontSize}}
        >
          Configure
        </Paragraph>
        <Menu mode="inline" style={{background: '#f0f2f5', borderBottom: '1px solid #d9d9d9', paddingBottom: '10px'}}>
          {menuItem({ key: 1, text: 'Cloud providers', link: '/admin/cloud-providers', icon: 'cloud' })}
          {menuItem({ key: 2, text: 'Cluster templates', link: '/admin/cluster-templates', icon: 'copy' })}
          {menuItem({ key: 3, text: 'Settings', link: '/admin/settings', icon: 'setting' })}
        </Menu>
      </div>
    ) : null
    return (
      <Sider
        collapsible
        collapsed={this.state.siderCollapsed}
        onCollapse={this.onSiderCollapse}
        style={{background: '#f0f2f5'}}
      >
        <AdminMenu />
        <Paragraph
          strong
          style={{marginTop: '15px', marginBottom: '5px', textAlign: 'center', fontSize: this.state.menuTitleFontSize}}
        >
          Teams
        </Paragraph>
        <Menu mode="inline" style={{background: '#f0f2f5', borderBottom: '1px solid #d9d9d9', paddingBottom: '10px'}}>
          {menuItem({ key: 1, text: 'New team', link: '/teams/new', icon: 'plus-circle' })}
        </Menu>
        <Paragraph
          strong
          style={{marginTop: '15px', marginBottom: '5px', textAlign: 'center', fontSize: this.state.menuTitleFontSize}}
        >
          Spaces
        </Paragraph>
        <Menu mode="inline" style={{background: '#f0f2f5', borderBottom: '1px solid #d9d9d9', paddingBottom: '10px'}}>
          {menuItem({ key: 1, text: 'New space', link: '/spaces/new', icon: 'plus-circle' })}
        </Menu>
        <style jsx>{`
        .menuHeading {
          margin-top: 15px;
          margin-bottom: 5px;
          text-align: center;
          font-size: ${this.state.menuTitleFontSize}
        }
      `}</style>
      </Sider>
    )
  }
}

export default SiderMenu
