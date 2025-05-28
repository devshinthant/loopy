const getAvailableDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioInputs = devices.filter((d) => d.kind === "audioinput");
  const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
  const videoInputs = devices.filter((d) => d.kind === "videoinput");

  return { audioInputs, audioOutputs, videoInputs };
};

export default getAvailableDevices;
