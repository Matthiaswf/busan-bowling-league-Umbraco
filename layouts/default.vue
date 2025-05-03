<template>
  <div>
    <header class="site-header">
      <h1 class="text-xl font-semibold">Busan Bowling League</h1>
    </header>

    <main class="page-container">
      <slot />
    </main>

    <footer class="site-footer">
      © {{ new Date().getFullYear() }} Busan Bowling League
    </footer>
  </div>
</template>
