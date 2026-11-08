import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { RETURN_CODES } from './lender-codes';

const cache = new Map<string, { explanation: string; suggestion: string }>();

// Public demo endpoint: input is limited to known codes and results are cached per code.
export const explainReturnCode = createServerFn({ method: 'POST' })
  .inputValidator((input: { code: string }) => ({ code: z.enum(['04', '61', '06']).parse(input.code) }))
  .handler(async ({ data }) => {
    const hit = cache.get(data.code);
    if (hit) return { ...hit, error: null as string | null };
    const rule = RETURN_CODES[data.code]!;
    try {
      const { generateResponse } = await import('@lovable.dev/ai-gateway');
      const res = await generateResponse({
        model: 'openai/gpt-6-astra',
        instructions: 'You explain Indian auto-debit (NACH) bounce codes to someone with no finance background. Use ONLY the desk rule given; never invent facts, laws or actions. Reply as JSON: {"explanation": one plain sentence under 25 words, "suggestion": one short action phrased as a suggestion that must be chosen from the allowed outcomes}.',
        input: `Code ${data.code}. Desk rule: cause="${rule.cause}", owner="${rule.owner}", next step="${rule.next}", allowed outcomes=${JSON.stringify(rule.outcomes)}.`,
      });
      let text = '';
      for (const item of res.output ?? []) if (item.type === 'message') for (const c of item.content) if (c.type === 'output_text') text += c.text;
      const parsed = z.object({ explanation: z.string().max(300), suggestion: z.string().max(200) }).parse(JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)));
      const suggestion = rule.outcomes.find(o => o === parsed.suggestion) ?? rule.outcomes[0]!;
      const out = { explanation: parsed.explanation, suggestion };
      cache.set(data.code, out);
      return { ...out, error: null as string | null };
    } catch (e) {
      console.error('explainReturnCode failed', e, JSON.stringify((e as { remote?: unknown }).remote));
      return { explanation: '', suggestion: '', error: 'The AI explanation is unavailable right now. The desk rule above still applies.' };
    }
  });
