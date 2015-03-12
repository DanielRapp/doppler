describe("doppler", function() {
  var doppler;

  beforeEach(function() {
    doppler = window.doppler;
  })

  it("should return an object with an init property that is a function", function() {
    expect(doppler.hasOwnProperty("init")).to.equal(true);
    expect(doppler.init).to.be.a("function");
  });

  it("should return an object with an stop property that is a function", function() {
    expect(doppler.hasOwnProperty("stop")).to.equal(true);
    expect(doppler.stop).to.be.a("function");
  });

  it("should keep all other properties of doppler private", function () {
    expect(doppler.getBandwith).to.equal(undefined);
  });


});
