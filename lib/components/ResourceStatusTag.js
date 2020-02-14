import PropTypes from 'prop-types'
import { Icon, Tag } from 'antd'
import { statusColorMap } from '../utils/ui-helpers'

const ResourceStatusTag = ({ status }) => (
  <Tag color={statusColorMap[status] || 'red'}>{status === 'Pending' ? <Icon type="loading" /> : null} {status}</Tag>
)

ResourceStatusTag.propTypes = {
  status: PropTypes.string.isRequired
}

export default ResourceStatusTag
