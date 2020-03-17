import PropTypes from 'prop-types'
import { statusColorMap, inProgressStatusList } from '../utils/ui-helpers'
import { Icon, Tag, Popover, Timeline, Typography } from 'antd'
const { Text, Paragraph } = Typography

const ResourceStatusTag = ({ resourceStatus }) => {
  const status = resourceStatus.status || 'Pending'
  const components = resourceStatus.components
  const conditions = resourceStatus.conditions

  const statusTag = <Tag color={statusColorMap[status] || 'red'}>{inProgressStatusList.includes(status) ? <Icon type="loading" /> : null} {status}</Tag>

  if (components) {
    return (
      <Popover placement="left" content={
        <Timeline
          pending={!status || inProgressStatusList.includes(status)}
          style={{
            marginTop: '25px',
            marginLeft: '10px',
            marginRight: '10px',
            marginBottom: !inProgressStatusList.includes(status) ? '-30px' : '0'
          }}>
          {components.map((c, idx) =>
            <Timeline.Item key={idx} color={statusColorMap[c.status] || 'red'}>
              <Text strong>{c.name}: </Text><Text>{c.message}</Text>
            </Timeline.Item>
          )}
        </Timeline>
      }>
        {statusTag}
      </Popover>
    )
  }

  if (conditions && conditions.length) {
    return (
      <Popover placement="left" content={
        conditions.map((c, idx) =>
          <Paragraph key={idx} style={{ marginBottom: '0', padding: '5px' }}>
            <Text strong>{c.message}</Text>
            <br/>
            <Text>{c.detail}</Text>
          </Paragraph>
        )
      }>
        {statusTag}
      </Popover>
    )
  }

  return statusTag
}

ResourceStatusTag.propTypes = {
  resourceStatus: PropTypes.object.isRequired
}

export default ResourceStatusTag
