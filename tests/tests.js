
import chai from 'chai';
import _ from'lodash';
import { deep } from '../../../dist/server/index';
_.merge(_, deep);

describe(
  'Lodash-extras',
  function () {
    it('should test', function () {
      console.log(deep);
      chai.expect(true).to.be.true;
    });
});
