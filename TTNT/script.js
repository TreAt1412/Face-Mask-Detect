
var myImage = new Image(320, 240)
Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpg',
    jpg_quality: 720
   });
   Webcam.attach( '#my_camera' );
  
  
  function take_snapshot() {
  image = null;
   // take snapshot and get image data
   Webcam.snap( function(data_uri) {
    // display results in page
    image = data_uri;
    } );
    document.getElementById('results').innerHTML = 
    '<img src="'+image+'" class="result-image" id="result-image"/>'
    
    myImage.src = image;
    recognition()
  }
  function myFunction(){
      setInterval(take_snapshot, 5000)
  }


  async function recognition(){
       // Load mobilenet module
    const mobilenetModule = await mobilenet.load({version: 2, alpha: 1});
    // Add examples to the KNN Classifier
    const classifier = await trainClassifier(mobilenetModule);

    // Predict class for the test image
    const testImage = document.getElementById("result-image");
    const tfTestImage = tf.browser.fromPixels(testImage);
    const logits = mobilenetModule.infer(tfTestImage, 'conv_preds');
    const prediction = await classifier.predictClass(logits);

    // Add a border to the test image to display the prediction result
    if (prediction.label == 1) { // no mask - red border
        testImage.classList.add('no-mask')
    } else { // has mask - green border
        testImage.classList.add('mask')
    }
  }
  recognition()
  window.onload = async () => {
    const maskImageCount = 5;
    const noMaskImageCount = 6;

    const trainImagesContainer = document.querySelector('.train-images');
    // Add mask images to the DOM and give them a class of `mask-img`
    for (let i = 1; i <= maskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `images/mask/${i}.jpg`);
        newImage.classList.add('mask-img');
        trainImagesContainer.appendChild(newImage);
    }
    // Add no mask images to the DOM and give them a class of `no-mask-img`
    for (let i = 1; i <= noMaskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `images/no_mask/${i}.jpg`);
        newImage.classList.add('no-mask-img');
        trainImagesContainer.appendChild(newImage);
    }

   
};



async function trainClassifier(mobilenetModule) {
    // Create a new KNN Classifier
    const classifier = knnClassifier.create();

    // Train using mask images
    const maskImages = document.querySelectorAll('.mask-img');
    maskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 0); // has mask
    });
    // Train using no mask images
    const noMaskImages = document.querySelectorAll('.no-mask-img');
    noMaskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 1); // no mask
    });

    return classifier;
}