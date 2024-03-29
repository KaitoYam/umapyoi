// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./myModel/";
const music = new Audio('musics/umapyoi.mp3');
let model, webcam, ctx, labelContainer, maxPredictions;
var playSound = 0;
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();
  
  // Convenience function to setup a webcam
  const size_X = 500;
  const size_Y = 375;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size_X, size_Y, flip); // width, height, flip1
  
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);
  
  // append/get elements to the DOM
  const canvas = document.getElementById("canvas");
  canvas.width = size_X; canvas.height = size_Y;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) { // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}
window.onload = init();
async function loop(timestamp) {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  //ウマぴょい伝説の読み取り

  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);
  if(playSound == 1){
      music.play();
      music.loop = false;
      console.log("一回しか出てはいけない");
    }
  
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
  for (let i = 0; i<maxPredictions; i++){
    if (prediction[i].className == "umapyoi") {
      if (prediction[i].probability.toFixed(2) == 1.00) {
        playSound++;
        if(music.ended == true){
          playSound == 0;
        }
        // console.log(playSound);
      }
    }
  }
  // finally draw the poses
  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
