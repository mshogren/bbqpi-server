function SensorData(channel, name) {
  if (!(this instanceof SensorData)) return new SensorData(channel, name);

  this.channel = channel;

  if (name) this.name = name;
}

SensorData.prototype.setTemperature = function setTemperature(temp) {
  this.temperature = temp;
};

module.exports = SensorData;

