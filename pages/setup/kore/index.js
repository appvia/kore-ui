import Link from 'next/link'
import PropTypes from 'prop-types'
import { Result, Icon, Button } from 'antd'

const SetupKoreIndexPage = ({ user }) => (
  <div>
    <Result
      icon={<Icon type="smile" theme="twoTone" />}
      title={`Welcome to Kore, ${user.displayName || user.name || user.id}!`}
      subTitle="As the first user you are now an administrator and are responsible for the initial setup"
      extra={[
        <Button key="buttonBegin" type="primary">
          <Link href="/setup/kore/cloud-providers">
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
  </div>
)

SetupKoreIndexPage.staticProps = {
  title: 'Welcome. Initial Kore setup',
  hideSider: true,
  adminOnly: true
}

SetupKoreIndexPage.propTypes = {
  user: PropTypes.object.isRequired
}

export default SetupKoreIndexPage
