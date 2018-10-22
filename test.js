var faker = require("faker");

var object;
object = {
    name: faker.lorem.word(),
    age: faker.random.number() % 15
}
console.log(object);
console.log(faker.lorem.sentences());
console.log(faker.date.recent());
console.log(String(1) === "1");

for (var i = 0; i < 3; i++) {
    var ran1= faker.random.number();
    var g;
    if (ran1 % 2 == 0) {
        g = "Male";
    } else {
        g = "Female";
    }
    var username = faker.name.firstName() + String(i);
    
    var object = {
        name: username,
        gender: g,
        age: 7 + faker.random.number() % 4,
        classNumber: faker.random.number() % 1000,
        contact1: faker.name.findName(),
        phone1: faker.phone.phoneNumberFormat(),
        contact2: faker.name.findName(),
        phone2: faker.phone.phoneNumberFormat(),
        isNoonCare: String(faker.random.boolean()),
        isAfternoonCare: String(faker.random.boolean()),
        timeEnrolled: faker.date.recent(),
        note: faker.lorem.sentences(),
    };
    console.log(object);
}