describe("$.render", function() {

  it("Single token", function() {
    assert.equal($.render("x"), "x");
    assert.equal($.render("x", {}), "x");
    assert.equal($.render("{x}", { x: "x" }), "x");
    assert.equal($.render("{x}", { x: "z" }), "z");
  });

  it("Multiple tokens", function() {
    assert($.render("{x}{y}", { x: "x", y: "y" }) == "xy");
  });

  it("Single quotes", function() {
    assert.equal($.render("'x'"), "'x'");
    assert.equal($.render("\'x.\';"), "\'x.\';");
  });

  it("Empty value", function() {
    assert.equal($.render("{x}", { x: undefined }), "");
    assert.equal($.render("{x}", { x: null }), "");
    assert.equal($.render("{x}", { x: false }), "");
    assert.equal($.render("{x}", { x: 0 }), "0");
  });

  it("With spaces", function() {
    assert.equal($.render("{ x }", { x: 'x' }), "x");
    assert.equal($.render("{x }", { x: 'x' }), "x");
    assert.equal($.render("{ x}", { x: 'x' }), "x");
    assert.equal($.render("{  x  }", { x: 'x' }), "x");
  });

  it("Empty template", function() {
    assert($.render() === "");
  });

  it("Nearby brackets", function() {
    assert.equal($.render("{{x}", { x: 'x' }), "{x");
    assert.equal($.render("{x}}", { x: 'x' }), "x}");
    assert.equal($.render("{{x}}", { x: 'x' }), "{x}");
  });

  if ($.trim) {
    it("<template> tag", function() {
      assert($.trim($.render($("#test1").html(), {x: 'x'})) == "x");
    });
  }

  it("String-breaking characters", function() {
    assert.equal($.render("x\r"), "x\r");
    assert.equal($.render("x\n"), "x\n");
    assert.equal($.render("x\u2028"), "x\u2028");
    assert.equal($.render("x\u2029"), "x\u2029");
  });

  it("Backslashes", function() {
    assert.equal($.render("\\{x}", { x: 'x' }), "\\x");
  });

  it("Entities", function() {
    assert.equal($.render("{x}", { x: '&' }), "&amp;");
    assert.equal($.render("{x}", { x: '"' }), "&quot;");
    assert.equal($.render("{x}", { x: '<' }), "&lt;");
    assert.equal($.render("{x}", { x: '>' }), "&gt;");
    assert.equal($.render("{$x}", { x: '<div>' }), "<div>");
  });

  it("Nested objects", function() {
    assert.equal($.render("{x.y}", { x: { y: 'x' }}), "x");
  });

  it("Undefined properties", function() {
    assert.equal($.render("{x}", {}), "");
    assert.equal($.render("{x.y.z}", {}), "");
  });

});
