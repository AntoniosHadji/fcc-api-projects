function cleanData(arr) {
  if (!arr) return { error: `arr is ${arr}` };

  let result = [];
  let index = 0;
  while (index < arr.length) {
    let tempObj = {};
    tempObj.imageUrl = arr[index].link;
    tempObj.altText = arr[index].snippet;
    tempObj.pageUrl = arr[index].image.contextLink;
    result.push(tempObj);
    index++;
  }
  return result;
}

module.exports = cleanData;

