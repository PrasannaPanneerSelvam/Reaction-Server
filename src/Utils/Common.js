export const FactoryFunction = function (constructorFn) {
  return function () {
    if (this instanceof constructorFn) {
      return this;
    }

    return new constructorFn();
  };
};
