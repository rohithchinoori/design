const getSum = (numberArr, target) => {
  const numberObjects = numberArr.map((value, index) => ({ value, index }));
  numberObjects.sort((a, b) => a.value - b.value);
  let left = 0;
  let right = numberArr.length - 1;
  while (left < right) {
    const sum = numberObjects[left].value + numberObjects[right].value;
    if (sum === target) {
      return [numberObjects[left].index, numberObjects[right].index];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }

  return null;
};

const result = getSum([5, 8, 9, 0], 14);
console.log(result);
