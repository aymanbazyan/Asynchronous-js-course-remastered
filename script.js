"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const input = document.querySelector(".form__input");
const submit = document.querySelector(".form__btn-submit");
const mypos = document.querySelector(".form__btn-mypos");
const clear = document.querySelector(".form__btn-clear");
const message = document.querySelector(".message");
const debounceBox = document.querySelector(".debounce__box");
const debounceBoxRowsCont = document.querySelector(".debounce__box_rows");

///////////////////////////////////////

const showError = function (msg) {
  message.textContent = msg;
  message.classList.remove("hidden");
  setTimeout(() => message.classList.add("hidden"), 4000);
};

const renderCountry = function (data, className = "") {
  const html = `
 <article class="country ${className}">
  <img class="country__img" src="${data.flags.png}"/>
  <div class="country__data">
    <h3 class="country__name">
    ${data.name.common}
    </h3>
    <h4 class="country__region">
    ${data.region}
    </h4>
    <p class="country__row">
    <span>👫</span>
    ${(data.population / 1000000).toFixed(2)}M people
    </p>
    <p class="country__row">
    <span>🗣️</span>
    ${Object.values(data.languages)[0]}
    </p>
    <p class="country__row">
    <span>💰</span>
    ${Object.values(data.currencies)[0].name}
    </p>
  </div>
 </article>
  `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
  clear.classList.remove("hidden");
};

const getJSON = async function (url, errorMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) showError(`${errorMsg}: ${response.status}`);
    return response.json();
  });
};
/*
const getCountryAndNeighbor = function (country) {
  // AJAX call country 1
  const request = new XMLHttpRequest();
  request.open("GET", `https://restcountries.com/v3.1/name/${country}`); // open request
  request.send(); // send request to API

  request.addEventListener("load", function () {
    //   console.log(this); // this = request (object)
    //   console.log(this.responseText); // this = request (JSON (big string of text))

    //   const data = JSON.parse(this.responseText);
    // because its just an array with 1 object we will destructre it:
    const [data] = JSON.parse(this.responseText);
    // console.log(data);

    //   console.log(Object.values(data.currencies)[0].name); (accesing first value of the object)

    // Render country 1
    renderCountry(data);

    // Get neighbor country (2)
    const neighbor = data.borders?.[0];

    if (!neighbor) return;

    // AJAX call country 2
    const request2 = new XMLHttpRequest();
    request2.open("GET", `https://restcountries.com/v3.1/alpha/${neighbor}`); // open request
    request2.send(); // send request to API

    /////////////////////////////////////////////// Callback hell example 1:

    // Render country 2
    request2.addEventListener("load", function () {
      const [data2] = JSON.parse(this.responseText);
      renderCountry(data2, "neighbour");
    });
  });
};
*/
////////////////////////////////////// another Callback hell example
// setTimeout(() => {
//   console.log("1 second passed");
//   setTimeout(() => {
//     console.log("2 second passed");
//     setTimeout(() => {
//       console.log("3 second passed");
//       setTimeout(() => {
//         console.log("4 second passed");
//         setTimeout(() => {
//           console.log("5 second passed");
//         }, 1000);
//       }, 1000);
//     }, 1000);
//   }, 1000);
// }, 1000);

// the old bad way: (might get you into callback hell)
//const request = new XMLHttpRequest();
//request.open("GET", `https://restcountries.com/v3.1/name/${country}`);
//request.send();

// the new way:
//const request = fetch(`https://restcountries.com/v3.1/name/libya`);
//console.log(request);

// const getCountryData = function (country) {
//   // after we use fetch(), it will be pending, we will use then() if
//   // the promise was accepted, the then() will take a callback function
//   // that has a response from the promise
//   fetch(`https://restcountries.com/v3.1/name/${country}`)
//     .then(function (response) {
//       console.log(response);
//       // we will get a response that we will need to read using json(),
//       // then we will get a promise (might be accepted or declined),
//       // then we will use then() again if it is accepted
//       return response.json();
//     })
//     .then(function (data) {
//       console.log(data);
//       renderCountry(data[0]);
//     });
// };

// Simplfied version:
// const getCountryData = function (country) {
//   // fetch(`https://restcountries.com/v3.1/name/${country}`)
//   //   .then((response) => response.json()) // this one will run if the promise is accepted
//   //   .then((data) => {
//   const data = getJSON(`https://restcountries.com/v3.1/name/${country}`);
//   console.log(data);
//   renderCountry(data[0]);

//   if (data[0].borders) {
//     const borders = data[0].borders;
//     borders.forEach((border) => {
//       fetch(`https://restcountries.com/v3.1/alpha/${border}`)
//         .then((response) => response.json())
//         .then((data) => renderCountry(data[0], "neighbour"));
//     });
//     // .catch((error) => showError(error)); // this one will run if the promise is rejected;
//     //.finally(() => this one will always run no matter if the promise is accepted or rejected);
//   }
// };

// Async await version:
const getCountryData = async function (country) {
  try {
    const [data] = await getJSON(
      `https://restcountries.com/v3.1/name/${country}`
    );

    renderCountry(data);
    if (data.borders) {
      const borders = data.borders;
      borders.forEach(async (border) => {
        const [neighbourCountry] = await getJSON(
          `https://restcountries.com/v3.1/alpha/${border}`
        );
        renderCountry(neighbourCountry, "neighbour");
      });
    }
  } catch (err) {
    showError(err);
  }
};

submit.addEventListener("click", (e) => {
  e.preventDefault();

  if (!input.value) return;

  countriesContainer.innerHTML = "";
  getCountryData(input.value);
  input.value = "";

  input.value != ""
    ? submit.classList.remove("locked")
    : submit.classList.add("locked");

  mypos.classList.remove("locked");
});

mypos.addEventListener("click", (e) => {
  e.preventDefault();

  countriesContainer.innerHTML = "";
  input.value = "";
  whereAmI();
  mypos.classList.add("locked");
});

clear.addEventListener("click", (e) => {
  e.preventDefault();

  countriesContainer.innerHTML = "";
  input.value = "";
  clear.classList.add("hidden");
  mypos.classList.remove("locked");
});

input.addEventListener("input", () => {
  input.value != ""
    ? submit.classList.remove("locked")
    : submit.classList.add("locked");
});

///////////////////////////////////////////////////////////////// Challenge 1
/*
const whereAmI = function (lat, lng) {
  fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  )
    .then((response) => {
      console.log(response);

      if (!response.ok) showError(`Problem with geocoding: ${response.status}`);

      return response.json();
    })
    .then((data) => {
      console.log(`You are in ${data.city}, ${data.countryName}`);
      getCountryData(data.countryName);
    })
    .catch((error) => console.log(error));
};

//whereAmI(52.508, 13.381);
//whereAmI(19.037, 72.873);
//whereAmI(-33.933, 18.474);
*/
///////////////////////////////////////////////////// The event loop
/*
console.log("test start");
setTimeout(() => {
  console.log("0 second timer"), 0;
});

// create a promise that is immediately accpeted
Promise.resolve("Resolved promise 1").then((response) => {
  console.log(response);
});

Promise.resolve("Resolved promise 2").then((response) => {
  for (let i = 0; i < 10; i++) {
    console.log(response);
  }
});

console.log("test end");
*/
///////////////////////////////////////////////////// bulding simple promise
/*
const lotteryPromise = new Promise(function (resolve, reject) {
  console.log("Lottery draw is happening 🔮");
  setTimeout(function () {
    if (Math.random() >= 0.5) {
      resolve("You WIN 💲");
    } else {
      reject(new Error("You lost your money 💩"));
    }
  }, 2000);
});

lotteryPromise
  .then((response) => {
    console.log(response);
    console.log("YAY I WON");
  })
  .catch((error) => {
    console.error(error);
    console.log("NOO");
  });

//////////// Promisifying setTimeout
const wait = function (seconds) {
  // we wont specify a reject parameter because timer never fails
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};

wait(1)
  .then(() => {
    console.log("1 second passed");
    return wait(1);
  })
  .then(() => {
    console.log("2 second passed");
    return wait(1);
  })
  .then(() => {
    console.log("3 second passed");
    return wait(1);
  })
  .then(() => {
    console.log("4 second passed");
    return wait(1);
  })
  .then(() => console.log("5 second passed"));

////////////////////////////// Callback hell
// setTimeout(() => {
//   console.log("1 second passed");
//   setTimeout(() => {
//     console.log("2 second passed");
//     setTimeout(() => {
//       console.log("3 second passed");
//       setTimeout(() => {
//         console.log("4 second passed");
//         setTimeout(() => {
//           console.log("5 second passed");
//         }, 1000);
//       }, 1000);
//     }, 1000);
//   }, 1000);
// }, 1000);

// automaticly accepted / declined
Promise.resolve("abc").then((x) => console.log(x));
Promise.reject(new Error("Problem!")).catch((x) => console.error(x));
*/

/////////////////////////////////////////////// Promisifying geolocation API

// Asynchronous code, (non blocking):

//navigator.geolocation.getCurrentPosition(
// (position) => console.log(position),
// (error) => console.error(error)
//);
//console.log("Getting position");

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    // navigator.geolocation.getCurrentPosition(
    //   (position) => resolve(position),
    //   (error) => reject(error)
    // );
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

/*
const whereAmI = function () {
  getPosition().then((pos) => {
    const { latitude: lat, longitude: lng } = pos.coords;

    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    )
      .then((response) => {
        if (!response.ok)
          showError(`Problem with geocoding: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        getCountryData(data.countryName);
      })
      .catch((error) => console.log(error));
  });
};
*/

///////////////////////////////////////////////////// Challenge 2
/*
const wait = function (seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * seconds);
  });
};


const createImg = function (imgPath) {
  return new Promise(function (resolve, reject) {
    wait(2).then(() => {
      const img = document.createElement("img");
      img.src = imgPath;
      document.querySelector(".images").append(img);

      img.addEventListener("load", () => {
        resolve(img);
      });

      img.addEventListener("error", () => {
        reject(new Error("image failed loading"));
      });
    });
  });
};

let currentImg;

createImg("img/img-1.jpg")
  .then((img) => {
    currentImg = img;
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = "none";
    return createImg("img/img-2.jpg");
  })
  .then((img) => {
    currentImg = img;
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = "none";
    return createImg("img/img-3.jpg");
  })
  .then((img) => {
    currentImg = img;
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = "none";
    return createImg("img/img-4.jpg");
  })
  .then((img) => {
    currentImg = img;
    return wait(2);
  })
  .then(() => {
    currentImg.style.display = "none";
    return createImg("img/img-5.jpg");
  })
  .then((img) => {
    currentImg = img;
    return wait(2);
  })
  .then(() => (currentImg.style.display = "none"));
*/

////////////////////////////////////////////// debounce failed feature

const debounceElementMaker = function (data) {
  const searchTerm = input.value.toLowerCase();
  const name = data.name.common.toLowerCase();

  if (name.includes(searchTerm)) {
    const html = `
      <button class="debounce__box_row">
        <p class="debounce__box_row-name">${data.name.common}</p>
        <div class="debounce__box_row-flag"><img src="${data.flags.png}" alt="flag"></div>
      </button>
    `;

    debounceBoxRowsCont.insertAdjacentHTML("afterbegin", html);
  }
};

let countries,
  inputCharacters,
  foundObjects,
  nameCommon,
  matchingCharacters,
  listItems;
// 1) take all data
fetch("https://restcountries.com/v3.1/all")
  .then((response) => response.json())
  .then((data) => {
    countries = data;
  });

// 2) Listen to input changes
input.addEventListener("input", () => {
  if (!countries) return;

  debounceBoxRowsCont.innerHTML = "";

  inputCharacters = input.value.toLowerCase();

  foundObjects = countries.filter((obj) => {
    nameCommon = obj.name.common.toLowerCase();
    matchingCharacters = [...inputCharacters].filter((char) =>
      nameCommon.includes(char)
    );
    return matchingCharacters.length >= 3;
  });

  if (!foundObjects) return;

  foundObjects.forEach((foundObject) => debounceElementMaker(foundObject));

  listItems = document.querySelectorAll(".debounce__box_row");
  listItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      countriesContainer.innerHTML = "";
      getCountryData(item.textContent.trim().toLowerCase());
      debounceBoxRowsCont.innerHTML = "";
      input.value = "";
      submit.classList.add("locked");
    });
  });
});

//////////////////////////////////////////////// async await
/*
const asyncAwait = async function (country) {
  //fetch(`https://restcountries.com/v3.1/name/${country}`)
  //.then(res => console.log(res))

  // Better asynchronous way that feels synchronous:
  const res = await fetch(`https://restcountries.com/v3.1/name/${country}`);
  const data = await res.json();
  console.log(data);
  renderCountry(data[0]);
};
asyncAwait("libya");
console.log("FIRST");
*/

// Await method:
const whereAmI = async function () {
  try {
    // Geolocation
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    // Reverse geocoding
    const resGeo = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!resGeo.ok) showError("Problem getting location data");

    const dataGeo = await resGeo.json();
    getCountryData(dataGeo.countryName);

    //return `You are in ${dataGeo.city}`;
  } catch (err) {
    mypos.classList.remove("locked");
    showError(err.message);

    // Reject promise returned from async function
    throw err;
  }
};
//using "try", we can catch the error and hadle it probably instead of the script just dies
// try {
//   let y = 1;
//   const x = 2;
//   x = 3;
// } catch (err) {
//   alert(err.message);
// }

// console.log("1: Will get location");
//const city = whereAmI();
//console.log(city);

// whereAmI()
//   .then((city) => console.log(`2: ${city}`))
//   .catch((err) => showError(`2: ${err}`))
//   .finally(() => console.log("3: Finished getting location"));

// (async function () {
//   try {
//     console.log("1: Will get location");
//     const whereAmICall = await whereAmI();
//     console.log(`2: ${whereAmICall}`);
//   } catch (err) {
//     showError(`2: ${err}`);
//   }
//   console.log("3: Finished getting location");
// })();

///////////////////////////
// running promises in parell (make the ajax calls doesn't wait for each other)
// it's called (combinators)
/*
const get3Countries = async function (c1, c2, c3) {
  try {
    //const [data1] = await getJSON(`https://restcountries.com/v3.1/name/${c1}`);
    //const [data2] = await getJSON(`https://restcountries.com/v3.1/name/${c2}`);
    //const [data3] = await getJSON(`https://restcountries.com/v3.1/name/${c3}`);

    // this will takes an array of promises and then return a new promise which
    // will run all the promises at the same time, it's faster indeed
    // use it when your promises doesn't depends on each other
    const data = await Promise.all([
      getJSON(`https://restcountries.com/v3.1/name/${c1}`),
      getJSON(`https://restcountries.com/v3.1/name/${c2}`),
      getJSON(`https://restcountries.com/v3.1/name/${c3}`),
    ]);
    // note: if 1 promise is rejected, then the whole Promise.all() is rejected as well

    // (remember: map is for looping over an array of arrays)
    console.log(data.map((array) => array[0].capital));
  } catch (err) {
    console.error(err);
  }
};
get3Countries("portugal", "libya", "tanzania");

////////////// other combinators methods:
// 1) Promise.race (the first promise to settle wins the race)
(async function () {
  const res = await Promise.race([
    getJSON(`https://restcountries.com/v3.1/name/italy`),
    getJSON(`https://restcountries.com/v3.1/name/egypt`),
    getJSON(`https://restcountries.com/v3.1/name/mexico`),
    // getJSON(`https://restcountries.com/v3.1/name/m45g5ergrdrgd`),
  ]);
  // console.log(res[0]);
  // notes:
  // 1) we get 1 result and not an array of all 3
  // 2) no matter if the request promise is fullfiled or rejected, the first one to load wins
  // 3) it's helpful againts never ending promises
})();

// example:
// reject after a period of time (for bad connections)
const timeout = function (sec) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error("Request took too long!"));
    }, sec * 1000);
  });
};
// (race againts timeout)
(async function () {
  try {
    const [data] = await Promise.race([
      getJSON(`https://restcountries.com/v3.1/name/mexico`),
      timeout(2),
    ]);
    console.log(data);
  } catch (err) {
    console.log(err);
  }
})();

// 2) Promise.allSettled, it will return an array of all promises when they settles,
// the difference between Promise.allSettled and Promise.all is that
// when a promise is rejected in Promise.all, all the Promise will be rejected,
(async function () {
  try {
    const res = await Promise.allSettled([
      Promise.resolve("Success"), // automaticly make a resolved promise
      Promise.reject("Rejected"), // automaticly make a rejected promise
      Promise.resolve("Another Success"),
    ]);
    console.log(res);
  } catch (err) {
    console.error(err);
  }
})();

// this will give a rejected promise:
// (async function () {
//   try {
//     const res = await Promise.all([
//       Promise.resolve("Success"), // automaticly make a resolved promise
//       Promise.reject("Rejected"), // automaticly make a rejected promise
//       Promise.resolve("Another Success"),
//     ]);
//     console.log(res);
//   } catch (err) {
//     console.error(err);
//   }
// })();

// Promise.any, it will take an array of promises and will give the first accepted
// promise, and it will ignore rejected promises, if there is no accepted promises,
// it will reject
(async function () {
  try {
    const res = await Promise.any([
      Promise.resolve("Success"), // automaticly make a resolved promise
      Promise.reject("Rejected"), // automaticly make a rejected promise
      Promise.resolve("Another Success"),
      Promise.reject("Another Rejected"), // automaticly make a rejected promise
    ]);
    console.log(res);
  } catch (err) {
    console.error(err);
  }
})();
*/
//////////////////////////////////////////// Coding challenge 3
/*
const wait = function (seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * seconds);
  });
};

const createImg = async function (...numbers) {
  let img = document.createElement("img");
  document.querySelector(".images").append(img);
  img.classList.add("parallel");

  const res = await Promise.all(numbers);

  for (const number of res) {
    try {
      img.src = `img/img-${number}.jpg`;
      await wait(2);
      img.style.display = "block";
      await wait(2);
      img.style.display = "none";
    } catch (err) {
      console.error(err);
    }
  }
};

createImg(1, 2, 3, 4, 5);
*/
