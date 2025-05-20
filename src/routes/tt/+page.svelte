<script lang="ts">
    import { source } from "sveltekit-sse";

    const value = source('/custom-event').select('message')
    // $inspect(value)
    value.subscribe(msg => {
        console.log(msg)
    })
</script>

<h1>Table Top</h1>
<p>Here will be scene view</p>

{$value}