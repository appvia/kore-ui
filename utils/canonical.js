module.exports = (string) => string.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\W/g, '-').toLowerCase()
