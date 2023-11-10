<template>
  <h2>Let's think of something to cook!</h2>
  <div class="card flex justify-content-center">
    <form @submit="onSubmit" class="form__content">
      <MultiSelect
        v-model="value"
        :class="{ 'p-invalid': errorMessage }"
        :options="products"
        optionLabel="name"
        placeholder="Select products"
        :maxSelectedLabels="3"
        class="select__style"
        aria-describedby="text-error"
      />
      <small id="text-error" class="p-error">{{
        errorMessage || '&nbsp;'
      }}</small>
      <div class="form__actions">
        <Button type="submit" label="Submit" />
        <Button @click="clearSearchAndData" label="Clear" />
      </div>
    </form>
  </div>

  <div v-if="myRecipeImage && myRecipeImage.length > 0">
    <h1>Recipe name: {{ myRecipe?.title }}</h1>
    <img :src="myRecipeImage" alt="my-recipe-image" class="image__style" />
    <div class="line" />
    <div class="card">
      <p class="card__title">Ingredients amount:</p>
      <div v-for="ingredient in myRecipe?.ingredientsAmount">
        {{ ingredient }}
      </div>
    </div>
    <div class="line" />
    <div class="card">
      <p class="card__title">Steps to cook:</p>
      <p class="left" v-for="step in myRecipe?.stepsToCook" >{{ step }}</p>
    </div>
    <div class="line" />
    <div class="tip__box">
      <p class="tip">TimeToCook: {{ myRecipe?.timeToCook }}</p>
      <p class="tip">difficulty: {{ myRecipe?.difficulty }}</p>
    </div>

    <div class="line" />
  </div>
  <h3 v-else-if="myRecipeImage === null">Select some products and Submit</h3>
  <h3 v-else>Loading...</h3>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useField, useForm } from 'vee-validate';
import MultiSelect from 'primevue/multiselect';
import { availableProductsInGrocery } from '../constants/availableProductsInGrocery.ts';
import { getDataFromGpt, getImageFromGpt } from '../api';
import Button from 'primevue/button';

const { handleSubmit, resetForm } = useForm();
const { value, errorMessage } = useField('value', validateField);

const myRecipe = ref<ReciepResponseType>();
const myRecipeImage = ref<string>(null as unknown as string);

const products = availableProductsInGrocery;

const clearSearchAndData = () => {
  myRecipeImage.value = null as unknown as string;
  resetForm();
};

function validateField(value: any) {
  if (!value) {
    return 'Ingredient is required.';
  }

  return true;
}

const onSubmit = handleSubmit(async values => {
  let detail = '';

  // @ts-ignore
  values.value.map((value: any, i: number) => {
    detail += value.name + (i < values.value.length - 1 ? ', ' : '');
  });

  if (values.value && values.value.length > 0) {
    myRecipeImage.value = '';
    const dataFromGpt = await getDataFromGpt(detail);
    myRecipe.value = JSON.parse(<string>dataFromGpt.choices[0].message.content);
    // @ts-ignore
    if ('title' in myRecipe?.value) {
      const imageFromChat = await getImageFromGpt(myRecipe.value.title);
      myRecipeImage.value = imageFromChat?.data[0]?.url || "";
    }
    resetForm();
  }
});
</script>

<style scoped>
.form__container {
  display: flex;
  justify-content: space-between;
}

.form__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  min-width: 500px;
}

.form__actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.select__style {
  width: 100%;
}

.image__style {
  border-radius: 50%;
}

.line {
  height: 3px;
  background: darkorange;
  margin: 15px 0;
}

.card {
  border-radius: 15px;
  background-color: #ededed;
  box-shadow: 0px -5px 5px -5px rgba(34, 60, 80, 0.6) inset;
}

.left {
  text-align: left;
}

.card__title {
  font-size: 22px;
  margin-bottom: 5px;
  font-weight: bold;
}

.tip__box {
  display: flex;
  gap: 10px;
}

.tip {
  padding: 0 10px;
  border-radius: 15px;
  background-color: #ededed;
  box-shadow: 0px -5px 5px -5px rgba(34, 60, 80, 0.6) inset;
}
</style>
