# FinSight IEEE Conference Paper

## Files

- `main.tex` - The complete IEEE conference format paper
- `references.bib` - BibTeX references (20 real SOTA papers)

## How to Compile

### Option 1: Overleaf (Recommended)
1. Go to [overleaf.com](https://www.overleaf.com)
2. Create a new project -> "Upload Project"
3. Upload both `main.tex` and `references.bib`
4. Set compiler to `pdfLaTeX`
5. Click "Recompile"

### Option 2: Local Compilation
```bash
# Requires TeX Live or MacTeX installed
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## References Included (20 Papers)

1. TradingAgents (Xiao et al., 2024) - arXiv:2412.20138
2. ai-hedge-fund (virattt, 2024)
3. BloombergGPT (Wu et al., 2023) - arXiv:2303.17564
4. FinBERT (Araci, 2019) - arXiv:1908.10063
5. FinGPT (Yang et al., 2023) - arXiv:2306.06031
6. Multi-Agent Survey (Guo et al., 2024) - arXiv:2402.01680
7. LLMs in Finance Survey (Li et al., 2024) - arXiv:2405.16274
8. Chain-of-Thought (Wei et al., 2022/NeurIPS) - arXiv:2201.11903
9. LoRA (Hu et al., 2021) - arXiv:2106.09685
10. Multi-Agent Debate (Du et al., 2023) - arXiv:2305.14325
11. Financial PhraseBank (Malo et al., 2014) - JASIST
12. Gemini 2.5 (Google DeepMind, 2025)
13. Alpha Vantage (2024)
14. LLM Agent in Trading Survey (Ding et al., 2024) - arXiv:2408.06361
15. FinLoRA (Wang et al., 2024) - arXiv:2412.11378
16. OpenBB (2024)
17. Multi-Agent System Survey (Chen et al., 2024) - arXiv:2412.17481
18. ContestTrade (Zhao et al., 2025) - arXiv:2508.00554
19. Attention Is All You Need (Vaswani et al., 2017/NeurIPS)
20. BERT (Devlin et al., 2019) - arXiv:1810.04805
