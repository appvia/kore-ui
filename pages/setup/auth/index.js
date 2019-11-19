import Link from 'next/link'
import { Layout, Typography, Result, Icon, Button } from 'antd'
const { Footer } = Layout
const { Paragraph } = Typography;

const SetupAuthIndexPage = () => (
  <div>
    <Result
      icon={<Icon type="smile" theme="twoTone" />}
      title="Welcome to the Hub!"
      subTitle="Authentication is not currently configured"
      extra={[
        <Paragraph key="para1">This must be done before any teams can start using the hub</Paragraph>,
        <Button key="button1" type="primary">
          <Link href="/setup/auth/configure">
            <a>Begin setup</a>
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

SetupAuthIndexPage.getInitialProps = async () => {
  return {
    title: 'No authentication provider configured',
    unrestrictedPage: true
  }
}

export default SetupAuthIndexPage
