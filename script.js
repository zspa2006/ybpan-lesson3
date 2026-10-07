const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meals-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
const SEARCH_URL = `${BASE_URL}search.php?s=`; 
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`; 

searchBtn.addEventListener("click", searchMeals);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchMeals();
});
mealsContainer.addEventListener("click", handleMealClick);
backBtn.addEventListener("click", () => {
  detailRequest++;
  mealDetails.classList.add("hidden");
});

let searchRequest = 0;
let detailRequest = 0;

async function searchMeals() {
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    return;
  }
  const request = ++searchRequest;
  detailRequest++;
  mealDetails.classList.add("hidden");
  try {
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
    resultHeading.classList.remove("hidden");   
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");
    const response = await fetch(`${SEARCH_URL}${encodeURIComponent(searchTerm)}`);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();

    if (request !== searchRequest) return;
    if (!data.meals || data.meals.length === 0) {
      resultHeading.textContent = ``;
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
      errorContainer.classList.remove("hidden");
    } else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;
      displayMeals(data.meals);
      searchInput.value = "";
      mealsContainer.classList.remove("hidden");  
    }
  } catch (error) {
    if (request !== searchRequest) return;
    resultHeading.textContent = "";
    console.error("searchMeals error:", error);   
    errorContainer.textContent = "Something went wrong. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}



function displayMeals(meals) {
  mealsContainer.innerHTML = "";
  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `;
  });
}

async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");
  if (!mealEl) return;

  const mealId = mealEl.getAttribute("data-meal-id");
  const request = ++detailRequest;
  errorContainer.classList.add("hidden");

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();

    if (request !== detailRequest) return;
    if (!data.meals || !data.meals[0]) throw new Error("Recipe not found");
    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];

      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
          ingredients.push({
            ingredient: meal[`strIngredient${i}`],
            measure: meal[`strMeasure${i}`] || "",
          });
        }
      }
      mealDetailsContent.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
           <h2 class="meal-details-title">${meal.strMeal}</h2>
           <div class="meal-details-category">
             <span>${meal.strCategory || "Uncategorized"}</span>
           </div>
           <div class="meal-details-instructions">
             <h3>Instructions</h3>
             <p>${meal.strInstructions}</p>
           </div>
           <div class="meal-details-ingredients">
             <h3>Ingredients</h3>
             <ul class="ingredients-list">
               ${ingredients
                 .map(
                   (item) => `
                 <li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>
               `
                 )
                 .join("")}
             </ul>
           </div>
           ${
             meal.strYoutube
               ? `
             <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Watch Video
             </a>
           `
               : ""
           }
         `;
      mealDetails.classList.remove("hidden");
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    if (request !== detailRequest) return;
    console.error("handleMealClick error:", error);   
    errorContainer.textContent = "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}
