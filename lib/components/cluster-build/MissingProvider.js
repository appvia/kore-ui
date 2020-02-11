import Link from 'next/link'
import PropTypes from 'prop-types'
import { Alert, Button } from 'antd'

const MissingProvider = ({ team }) => (
  <div>
    <Alert
      message="No providers found"
      description="No providers could be found allocated to this team, therefore you cannot request a cluster build at this time. Please continue to the team dashboard."
      type="info"
      showIcon
      style={{ marginBottom: '20px'}}
    />
    <Button type="primary">
      <Link href="/teams/[name]" as={`/teams/${team}`}>
        <a>Team dashboard</a>
      </Link>
    </Button>
  </div>
)

MissingProvider.propTypes = {
  team: PropTypes.string.isRequired
}

export default MissingProvider
