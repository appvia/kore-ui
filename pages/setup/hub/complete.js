import Link from 'next/link'
import { Layout, Typography, Result, Button } from 'antd'
const { Footer } = Layout
const { Paragraph, Text } = Typography;

const SetupCloudProvidersCompletePage = () => (
  <div>
    <Result
      status="success"
      title="Hub setup complete"
      subTitle="You have configured the minimum setting in order to work with the hub"
      extra={[
        <Button type="primary" key="buttonContinue">
          <Link href="/">
            <a>Continue</a>
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

SetupCloudProvidersCompletePage.getInitialProps = async () => {
  return {
    title: 'Hub setup complete',
    hideSider: true
  }
}

export default SetupCloudProvidersCompletePage
