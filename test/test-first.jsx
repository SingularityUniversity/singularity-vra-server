import expect from 'expect'
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      expect([1,2,3].indexOf(5)).toEqual(-1);
      expect([1,2,3].indexOf(0)).toEqual(-1);
    });
  });
});
