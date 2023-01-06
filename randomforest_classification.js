// ROI
var singapore = shapefile.filter(ee.Filter.eq('country_na','Singapore'));
var UK = shapefile.filter(ee.Filter.eq('country_na','United Kingdom'));
//Map.addLayer(UK,{},'UK',false)

var cloudFilter = ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10);   
var eng_cloudFilter = ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 0.5);   
var startDate = '2018-01-01';
var endDate = '2022-12-31';

var images = imageCollection.filter(ee.Filter.date(startDate,endDate)).filterBounds(geometry).
filter(cloudFilter);
print(images)
var eng_images = imageCollection.filter(ee.Filter.date(startDate,endDate)).filterBounds(England).
filter(eng_cloudFilter);
var uk_images = imageCollection.filter(ee.Filter.date(startDate,endDate)).filterBounds(England).
filter(eng_cloudFilter);

var cropped_eng_images = imageCollection.filter(ee.Filter.date(startDate,endDate)).filterBounds(England_cropped).
filter(eng_cloudFilter);
print(eng_images)

// var single_sen_image_bands = images.filter(ee.Filter.eq(
//   'system:index','20180208T110209_20180208T110211_T30UYB')).first().clip(geometry);

var croped_single_sen_image_band = images.select(['B2','B3','B4','B5','B6','B7','B8','B8A','B9'])
.filter(ee.Filter.eq('system:index','20210425T031539_20210425T033040_T48NUG')).
first().clip(geometry);

var singapore_single_sen_image_band = images.select(['B2','B3','B4','B5','B6','B7','B8','B8A','B9'])
.filter(ee.Filter.eq('system:index','20210425T031539_20210425T033040_T48NUG')).
first().clip(singapore);

var eng_single_sen_image_band = eng_images.select(['B2','B3','B4','B5','B6','B7','B8','B8A','B9']).
mean().clip(England);
print(eng_single_sen_image_band)
var uk_single_sen_image_band = uk_images.select(['B2','B3','B4','B5','B6','B7','B8','B8A','B9']).
mean().clip(UK);
print(uk_single_sen_image_band)
var cropped_eng_single_sen_image_band = cropped_eng_images.select(['B2','B3','B4','B5','B6','B7','B8','B8A','B9']).
mean().clip(England_cropped);
print(cropped_eng_single_sen_image_band)

// Map.addLayer(nd,{min:0,max:1,palette:['white','green']},'MNDWI');

// Train Singpaore Model/////////////////////////////////////////////////////////////
var train_points = Urban.merge(Water).merge(Others);

print(train_points)

var label = 'Class';
var bands = ['B2','B3','B4', 'B8'];


// // Overlay the points on the singgapore input imagery to get training 
// var input = croped_single_sen_image_band.select(bands);
// var trainImage = input.sampleRegions({
//   collection:train_points,
//   properties:[label],
//   scale: 10
// });

// var training_data = trainImage.randomColumn();
// var split = 0.8
// var train_set = training_data.filter(ee.Filter.lt('random', split));
// print(train_set.size())
// var test_set = training_data.filter(ee.Filter.greaterThanOrEquals('random', split));
// print(test_set.size())

// // ML CarTress Model
// var cart_classifier = ee.Classifier.smileCart().train(train_set, label, bands); 

// // ML rf Model
// var rf_classifier = ee.Classifier.smileRandomForest(200).train(train_set, label, bands); 

// // Classify theimage
// var cart_classified = singapore_single_sen_image_band.classify(cart_classifier);
// var rf_classified = singapore_single_sen_image_band.classify(rf_classifier);
// var rf_classified0 = rf_classified.updateMask(rf_classified.eq(0));

// //Classify the image
// var test_classify = test_set.classify(rf_classifier);

// // Get a confusion matrix and overall accuracy for the validation sample.

// var testAccuracy = test_classify.errorMatrix(label, 'classification');
// print('rf Validation error matrix', testAccuracy);
// print('rf Validation accuracy', testAccuracy.accuracy());



// // Classify the image
// var test_classify = test_set.classify(cart_classifier);

// // Get a confusion matrix and overall accuracy for the validation sample.

// var testAccuracy = test_classify.errorMatrix(label, 'classification');
// print('cart Validation error matrix', testAccuracy);
// print('cart Validation accuracy', testAccuracy.accuracy());
///////////////////////////////////////////////////////////////////////////////////////

//Train England Model

var eng_input = cropped_eng_single_sen_image_band.select(bands);

// Overlay the points on the england input imagery to get training 
var eng_trainImage = eng_input.sampleRegions({
  collection:train_points,
  properties:[label],
  scale: 10
});

var eng_training_data = eng_trainImage.randomColumn();
var split = 0.8
var eng_train_set = eng_training_data.filter(ee.Filter.lt('random', split));
print(eng_train_set.size())
var eng_test_set = eng_training_data.filter(ee.Filter.greaterThanOrEquals('random', split));
print(eng_test_set.size())

// ML CarTress Model
var eng_cart_classifier = ee.Classifier.smileCart().train(eng_train_set, label, bands); 

// ML rf Model
var eng_rf_classifier = ee.Classifier.smileRandomForest(200).train(eng_train_set, label, bands); 

// Classify theimage
var eng_cart_classified = cropped_eng_single_sen_image_band.classify(eng_cart_classifier);
var eng_rf_classified = cropped_eng_single_sen_image_band.classify(eng_rf_classifier);
var eng_rf_classified0 = eng_rf_classified.updateMask(eng_rf_classified.eq(0));

// Classify the image
var test_classify = eng_test_set.classify(eng_rf_classifier);
// Get a confusion matrix and overall accuracy for the validation sample.
var testAccuracy = test_classify.errorMatrix(label, 'classification');
print('rf Validation error matrix', testAccuracy);
print('rf Validation accuracy', testAccuracy.accuracy());
// Classify the image
var cart_test_classify = eng_test_set.classify(eng_cart_classifier);
// Get a confusion matrix and overall accuracy for the validation sample.
var testAccuracy = cart_test_classify.errorMatrix(label, 'classification');
print('cart Validation error matrix', testAccuracy);
print('cart Validation accuracy', testAccuracy.accuracy());

///////////////////////////////////////////////////////////////////////////////////////





// Define a palette for the classification

var landcoverPalette = [
  '900C3F', //urban(0)
  '00FAF6', //water (1)
  'DFEED7' //others(2)
  ]

// Map.centerObject(singapore,12)
// Map.addLayer(singapore_single_sen_image_band,{bands:['B4','B3','B2'], min:0,max:5000},'TCC');  
// //Map.addLayer(cart_classified.clip(singapore), {palette: landcoverPalette, min:0, max:2},'cart_classification');
// //Map.addLayer(rf_classified.clip(singapore), {palette: landcoverPalette, min:0, max:2},'rf_classification');
// Map.addLayer(rf_classified0,{palette:['900C3F'],min:0,max:1},'Urban');

Map.centerObject(England,7)
Map.addLayer(eng_single_sen_image_band,{bands:['B4','B3','B2'], min:0,max:5000},'TCC'); 
// Map.addLayer(eng_cart_classified.clip(England_cropped), {palette: landcoverPalette, min:0, max:2},'cart_classification');
// Map.addLayer(eng_rf_classified.clip(England_cropped), {palette: landcoverPalette, min:0, max:2},'rf_classification');
Map.addLayer(eng_rf_classified0,{palette:['900C3F'],min:0,max:1},'Urban');







// set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '8px 15px'
  }
});
 
// Create legend title
var legendTitle = ui.Label({
  value: 'Legend',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});
 
// Add the title to the panel
legend.add(legendTitle);
 
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
 
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor: color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
 
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
 
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};
 
//  Palette with the colors
var palette =landcoverPalette;
 
// name of the legend
var names = ['Urban','Water body','Others'];
 
// Add color and and names
for (var i = 0; i <3; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  
 
// add legend to map (alternatively you can also print the legend to the console)
Map.add(legend);

// set position of panel
var title = ui.Panel({
  style: {
    position: 'top-center',
    padding: '8px 15px'
  }
});
 
// // Create legend title
// var mapTitle = ui.Label({
//   value: 'Singapore classification',
//   style: {
//     fontWeight: 'bold',
//     fontSize: '18px',
//     margin: '0 0 4px 0',
//     padding: '0'
//     }
// });
 
// // Add the title to the panel
// title.add(mapTitle);
// Map.add(title);




















