# GraphVerse – Graph Theory in Real Life

**Live Demo:** https://graphverse-eta.vercel.app/

GraphVerse is an interactive educational project that demonstrates how graph theory can represent and analyze real-world systems. It helps users explore networks, relationships, web links, and shortest routes through visual graph examples and algorithm-based analysis.

## Table of Contents

- [Overview](#overview)
- [Modules](#modules)
- [Key Concepts](#key-concepts)
- [How to Use](#how-to-use)
- [Project Goals](#project-goals)
- [Team](#team)
- [Live Demo](#live-demo)

## Overview

Graph theory represents objects as **vertices (nodes)** and connections as **edges**. GraphVerse demonstrates this through four educational modules. Users can explore a graph, change relationships or links where supported, and view the resulting statistics or algorithm output.

## Modules

### 1. Social Media Network

Models users and their follow relationships as a **directed graph**.

- An arrow `A → B` means A follows B.
- The relationship is not automatically mutual.
- **In-degree** is the number of incoming edges (followers).
- **Out-degree** is the number of outgoing edges (accounts followed).
- Follow/unfollow actions demonstrate how a graph changes.

### 2. Three Utilities Problem

Explores connecting three houses to three utilities—water, power, and gas—without crossing lines.

- The graph is the complete bipartite graph **K₃,₃**.
- It contains 6 vertices and 9 edges.
- A simple planar bipartite graph with `V ≥ 3` must satisfy `E ≤ 2V − 4`.
- For K₃,₃, this means `E ≤ 8`, but K₃,₃ has 9 edges. Therefore, K₃,₃ is non-planar.

### 3. Web Graph and PageRank

Represents web pages as nodes and hyperlinks as directed edges.

- An arrow from one page to another represents a hyperlink.
- Incoming and outgoing links show how pages are connected.
- A simplified PageRank process distributes rank through outgoing links and repeats the calculation over multiple iterations.
- The educational model uses a damping factor of 0.85.

This demonstrates the basic PageRank concept; it does not reproduce Google's complete search-ranking system.

### 4. Maps and Shortest Path

Represents locations as nodes and roads as weighted edges.

- Edge weights represent illustrative distances.
- A route's total distance is the sum of its edge weights.
- **Dijkstra's algorithm** finds a shortest path when all edge weights are non-negative.
- The visualization demonstrates distance updates and the final route.

The distances are sample values and are not live Google Maps data.

## Key Concepts

- Vertices (nodes) and edges
- Directed, undirected, and weighted graphs
- In-degree and out-degree
- Complete bipartite graph K₃,₃
- Planarity and Euler's formula
- Web graphs and simplified PageRank
- Weighted paths and Dijkstra's shortest-path algorithm
- Interactive graph visualization

## How to Use

1. Open the [GraphVerse live demo](https://graphverse-eta.vercel.app/).
2. Select a module: Social Media, Three Utilities, Web Graph, or Maps.
3. Explore the nodes and edges in the graph.
4. Use available interactions, such as changing follow relationships, adding/removing links, or selecting route locations.
5. Run the relevant analysis and observe the updated graph, statistics, rankings, or shortest path.
6. Use the visual results to understand how graph theory applies to real-world examples.

The exact interactions available may vary by module.

## Project Goals

- Explain graph theory through familiar real-world examples.
- Help learners understand graph structures visually.
- Demonstrate how graph algorithms analyze relationships and routes.
- Connect theoretical concepts with interactive experimentation.

## Team

- Mahek Tamboli
- Avinash Sonone
- Sumit Tayade
- Devansh Talekar
- Sawood

## Live Demo

Try the project here: **https://graphverse-eta.vercel.app/**

---

**Note:** GraphVerse is an educational demonstration. Sample map distances and simplified PageRank results are intended for learning, not live navigation or a representation of Google's complete ranking system.
