//https://stackoverflow.com/questions/27030/comparing-arrays-of-objects-in-javascript
export const objectsEqual = (o1, o2) => {
  return (
    Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every((p) => o1[p] === o2[p])
  );
};

export const arraysEqual = (a1, a2) => {
  return (
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]))
  );
};
