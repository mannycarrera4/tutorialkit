import { z } from 'zod';

export const commandSchema = z.union([
  // a single string, the command to run
  z.string(),

  // a tuple of two strings, the command followed by a title
  z.tuple([z.string(), z.string()]),

  z.strictObject({
    command: z.string(),
    title: z.string(),
  }),
]);

export type CommandSchema = z.infer<typeof commandSchema>;

export const commandsSchema = z.object({
  mainCommand: commandSchema.optional(),
  prepareCommands: commandSchema.array().optional(),
});

export type CommandsSchema = z.infer<typeof commandsSchema>;

export const previewSchema = z.union([
  // a single number, the port for the preview
  z.number(),

  // a tuple, the port followed by a title
  z.tuple([z.number(), z.string()]),

  z.strictObject({
    port: z.number(),
    title: z.string(),
  }),
]);

export type PreviewSchema = z.infer<typeof previewSchema>;

export const terminalSchema = z.union([
  // will just show a terminal
  z.boolean(),

  z.strictObject({
    panels: z.union([
      // either literally just `output`
      z.literal('output'),

      // or literally `terminal`
      z.literal('terminal'),

      /**
       * Or an array of `output` and/or `terminal` literals and/or tuples where the first value is either `output` or
       * `terminal`, and the second being the name.
       */
      z.array(
        z.union([
          z.union([
            z.literal('output'),
            z.literal('terminal')
          ]),
          z.tuple([
            z.union([
              z.literal('output'),
              z.literal('terminal')
            ]),
            z.string()
          ])
        ])
      ).refine(
        (arg) => {
          let output = 0;

          for (const value of arg) {
            if (value === 'output' || (Array.isArray(value) && value[0] === 'output')) {
              output++;
            }

            if (output > 1) {
              return false;
            }
          }

          return true;
        },
        {
          message: 'Only a single output panel can be defined.'
        }
      )
    ]),
    activePanel: z.number().positive().optional(),
  })
]);

export type TerminalSchema = z.infer<typeof terminalSchema>;

export const webcontainerSchema = commandsSchema.extend({
  previews: previewSchema.array().optional(),
  autoReload: z.boolean().optional(),
  template: z.string().optional(),
  terminal: terminalSchema.optional(),
});

export const baseSchema = webcontainerSchema.extend({
  title: z.string(),
  slug: z.optional(z.string()),
});

export type BaseSchema = z.infer<typeof baseSchema>;