import Link from 'next/link'
import { Layout, Result, Icon, Button } from 'antd'
const { Footer } = Layout

const SetupCloudProvidersIndexPage = ({ user }) => (
  <div>
    <Result
      icon={<Icon type="smile" theme="twoTone" />}
      title={`Welcome to the Hub, ${user.displayName}!`}
      subTitle="As the first user you are now an administrator and are responsible for the initial setup"
      extra={[
        <Button key="button1" type="primary">
          <Link href="/setup/cloud-providers/configure">
            <a>Begin setup</a>
          </Link>
        </Button>,
        <Button key="button2">
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

SetupCloudProvidersIndexPage.getInitialProps = async () => {
  return {
    title: 'Welcome. Initial Hub setup',
    hideSider: true
  }
}

export default SetupCloudProvidersIndexPage
