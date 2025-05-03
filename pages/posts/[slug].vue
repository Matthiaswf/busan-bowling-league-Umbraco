<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>

<template>
  <section class="page-section">
    <h2 class="section-title">Post: {{ route.params.slug }}</h2>
    <p class="text-gray-600">Post content will go here.</p>
  </section>
</template>
