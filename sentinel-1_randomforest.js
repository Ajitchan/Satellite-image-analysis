var sentinel1 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-06-01', '2021-06-15')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                    .filterBounds(geometry);
var sentinel2 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-06-16', '2021-06-30')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry);
var sentinel3 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-07-01', '2021-07-15')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry);
var sentinel4 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-07-16', '2021-07-31')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry);
                    
var sentinel5 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-08-01', '2021-08-15')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry);
var sentinel6 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-08-16', '2021-08-31')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry);   
var sentinel7 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-09-01', '2021-09-15')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                     .filterBounds(geometry); 
var sentinel8 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-09-16', '2021-09-30')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                    .filterBounds(geometry);  
var sentinel9 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-10-01', '2021-10-15')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                    .filterBounds(geometry);
var sentinel10 = ee.ImageCollection('COPERNICUS/S1_GRD')
                    .filterDate('2021-10-16', '2021-10-31')
                    .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                    .filter(ee.Filter.eq('instrumentMode', 'IW'))
                    .filter(ee.Filter.or((ee.Filter.eq('orbitProperties_pass', 'ASCENDING'), ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))))
                    .filterBounds(geometry);
                    
var image1 = sentinel1.select('VH').mean().rename('VH1');
var image2 = sentinel2.select('VH').mean().rename('VH2');
var image3 = sentinel3.select('VH').mean().rename('VH3');
var image4 = sentinel4.select('VH').mean().rename('VH4');
var image5 = sentinel5.select('VH').mean().rename('VH5');
var image6 = sentinel6.select('VH').mean().rename('VH6');
var image7 = sentinel7.select('VH').mean().rename('VH7');
var image8 = sentinel8.select('VH').mean().rename('VH8');
var image9 = sentinel9.select('VH').mean().rename('VH9');
var image10 = sentinel10.select('VH').mean().rename('VH10');

var stacked = image1.addBands([image2,image3,image4,image5,image6,image7,image8,image9,image10]).clip(geometry);
print(stacked);
var image_filtered = ee.Image(toDB(RefinedLee(toNatural(stacked))));
var bands = ['VH2', 'VH4', 'VH9'];
var label = 'class'
var training_pts = Urban.merge(Water).merge(Others);

////
var training = stacked.sampleRegions({
  collection: training_pts,
  properties: ['class'],
  scale: 10
});

var training_data = training.randomColumn();
var split = 0.8
var train_set = training_data.filter(ee.Filter.lt('random', split));
print(train_set.size())
var test_set = training_data.filter(ee.Filter.greaterThanOrEquals('random', split));
print(test_set.size())


// ML CarTress Model
var cart_classifier = ee.Classifier.smileCart().train(train_set, label, bands); 

// ML rf Model
var rf_classifier = ee.Classifier.smileRandomForest(100).train(train_set, label, bands); 

// Classify theimage
var cart_classified = stacked.classify(cart_classifier);
var rf_classified = stacked.classify(rf_classifier);
var rf_classified1 = rf_classified.updateMask(rf_classified.eq(1));
var rf_classified2 = rf_classified.updateMask(rf_classified.eq(2));
//Classify the image
var rf_test_classify = test_set.classify(rf_classifier);

// Get a confusion matrix and overall accuracy for the validation sample.

var rf_testAccuracy = rf_test_classify.errorMatrix(label, 'classification');
print('rf Validation error matrix', rf_testAccuracy);
print('rf Validation accuracy', rf_testAccuracy.accuracy());



// Classify the image
var cart_test_classify = test_set.classify(cart_classifier);

// Get a confusion matrix and overall accuracy for the validation sample.

var cart_testAccuracy = cart_test_classify.errorMatrix(label, 'classification');
print('cart Validation error matrix', cart_testAccuracy);
print('cart Validation accuracy', cart_testAccuracy.accuracy());


var landcoverPalette = [
  '900C3F', //urban(0)
  '00FAF6', //water (1)
  'DFEED7' //others(2)
  ]



var display = {bands: bands, min: -30, max: -10};
Map.centerObject(geometry)
Map.addLayer(stacked, display, 'stacked');

Map.addLayer(cart_classified.clip(geometry), {palette: landcoverPalette, min:1, max:3},'cart_classification');
Map.addLayer(rf_classified.clip(geometry), {palette: landcoverPalette, min:1, max:3},'rf_classification');
Map.addLayer(rf_classified1,{palette:['900C3F'],min:0,max:1},'Urban');
Map.addLayer(rf_classified2,{palette:['00FAF6'],min:0,max:1},'Water');









