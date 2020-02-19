import Link from 'next/link'
import { Result, Button } from 'antd'

const SetupKoreCompletePage = () => (
  <div>
    <Result
      status="success"
      title="Kore setup complete"
      subTitle="You have configured the minimum settings in order to work with Kore"
      extra={[
        <Button type="primary" key="buttonContinue">
          <Link href="/">
            <a>Continue</a>
          </Link>
        </Button>
      ]}
    />
  </div>
)

SetupKoreCompletePage.staticProps = {
  title: 'Kore setup complete',
  hideSider: true,
  adminOnly: true
}

export default SetupKoreCompletePage
