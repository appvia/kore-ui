import PropTypes from 'prop-types'
import { statusColorMap } from '../utils/ui-helpers'
import { Icon, Tag, Popover, Timeline, Typography } from 'antd'
const { Text } = Typography

const ResourceStatusTag = ({ resourceStatus }) => {
  const status = resourceStatus.status || 'Pending'
  const components = resourceStatus.components

  if (components) {
    return (
      <Popover placement="left" content={
        <Timeline
          pending={!status || status === 'Pending'}
          style={{
            marginTop: '25px',
            marginLeft: '10px',
            marginRight: '10px',
            marginBottom: status !== 'Pending' ? '-30px' : '0'
          }}>
          {components.map((c, idx) =>
            <Timeline.Item key={idx} color={statusColorMap[c.status] || 'red'}>
              <Text strong>{c.status}: </Text><Text>{c.message}</Text>
            </Timeline.Item>
          )}
        </Timeline>
      }>
        <Tag color={statusColorMap[status] || 'red'}>{status === 'Pending' ? <Icon type="loading" /> : null} {status}</Tag>
      </Popover>
    )
  }

  return <Tag color={statusColorMap[status] || 'red'}>{status === 'Pending' ? <Icon type="loading" /> : null} {status}</Tag>
}

ResourceStatusTag.propTypes = {
  resourceStatus: PropTypes.object.isRequired
}

export default ResourceStatusTag
