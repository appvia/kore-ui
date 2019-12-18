import Link from 'next/link'
import PropTypes from 'prop-types'
import { Layout, Result, Icon, Button } from 'antd'
const { Footer } = Layout

const SetupHubIndexPage = ({ user }) => (
  <div>
    <Result
      icon={<Icon type="smile" theme="twoTone" />}
      title={`Welcome to the Hub, ${user.displayName}!`}
      subTitle="As the first user you are now an administrator and are responsible for the initial setup"
      extra={[
        <Button key="buttonBegin" type="primary">
          <Link href="/setup/hub/cloud-providers">
            <a>Begin setup</a>
          </Link>
        </Button>,
        <Button key="buttonSkip">
          <Link href="/">
            <a>Skip</a>
          </Link>
        </Button>
      ]}
    />
    <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
    </Footer>
  </div>
)

SetupHubIndexPage.staticProps = {
  title: 'Welcome. Initial Hub setup',
  hideSider: true
}

SetupHubIndexPage.propTypes = {
  user: PropTypes.object.isRequired
}

export default SetupHubIndexPage
