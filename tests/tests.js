import chai from 'chai';
import _ from'lodash';
import { all } from '../../../dist/server/index';
_.merge(_, all);

describe(
  'Lodash-extras',
  function () {
    it('should test', function () {
      chai.expect(true).to.be.true;
    });
});
