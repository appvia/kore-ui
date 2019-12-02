module.exports = ({ apiVersion, kind, name, spec }) => ({
  apiVersion,
  kind,
  metadata: {
    name
  },
  spec
})
