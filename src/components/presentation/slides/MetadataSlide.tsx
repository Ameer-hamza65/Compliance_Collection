import { motion } from 'framer-motion';
import { SlideLayout } from '../SlideLayout';
import { FileText } from 'lucide-react';

const fields = [
  { field: 'title', type: 'text', example: '"Morgan & Mikhail\'s Clinical Anesthesiology"' },
  { field: 'authors', type: 'text[]', example: '["Butterworth", "Mackey", "Wasnick"]' },
  { field: 'publisher', type: 'text', example: '"McGraw-Hill Education"' },
  { field: 'isbn', type: 'text', example: '"978-1-260-47379-7"' },
  { field: 'edition', type: 'text', example: '"7th Edition"' },
  { field: 'published_year', type: 'integer', example: '2022' },
  { field: 'specialty', type: 'text', example: '"Anesthesia"' },
  { field: 'tags', type: 'text[]', example: '["anesthesia", "perioperative", "patient_safety"]' },
  { field: 'file_type', type: 'text', example: '"epub" | "pdf"' },
];

export function MetadataSlide() {
  return (
    <SlideLayout className="bg-[hsl(222,47%,6%)] text-[hsl(210,40%,92%)]">
      <div className="relative z-10 flex h-full">
        <div className="w-[38%] flex flex-col justify-center px-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-[14px] font-bold tracking-[0.3em] uppercase text-[hsl(220,70%,55%)] mb-3 block">Pillar 3</span>
            <h2 className="text-[60px] font-black leading-tight tracking-tight mb-6">
              Metadata<br />Structure
            </h2>
            <p className="text-[20px] text-[hsl(215,20%,55%)] leading-relaxed">
              Rich, structured metadata for every title — enabling intelligent search, AI context, and compliance classification.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex gap-4"
          >
            {['12+ Fields', 'Array Tags', 'Auto-Indexed'].map((badge, i) => (
              <div key={badge} className="px-4 py-2 rounded-lg border border-[hsl(220,70%,55%/0.3)] bg-[hsl(220,70%,55%/0.08)] text-[hsl(220,70%,55%)] text-[14px] font-semibold">
                {badge}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="flex-1 flex items-center pr-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="w-full rounded-2xl border border-[hsl(220,20%,16%)] bg-[hsl(222,40%,9%)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-8 py-4 border-b border-[hsl(220,20%,16%)] bg-[hsl(222,40%,7%)]">
              <FileText className="w-5 h-5 text-[hsl(220,70%,55%)]" />
              <span className="font-mono text-[16px] font-bold text-[hsl(220,70%,55%)]">books</span>
              <span className="text-[14px] text-[hsl(215,20%,45%)]">— table schema</span>
            </div>
            <div className="px-8 py-5">
              <table className="w-full text-[16px]">
                <thead>
                  <tr className="border-b border-[hsl(220,20%,14%)]">
                    <th className="text-left py-2.5 text-[hsl(215,20%,45%)] font-semibold w-[20%]">Field</th>
                    <th className="text-left py-2.5 text-[hsl(215,20%,45%)] font-semibold w-[15%]">Type</th>
                    <th className="text-left py-2.5 text-[hsl(215,20%,45%)] font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((f, i) => (
                    <motion.tr
                      key={f.field}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="border-b border-[hsl(220,20%,10%)]"
                    >
                      <td className="py-2.5 font-mono font-semibold text-[hsl(174,72%,46%)]">{f.field}</td>
                      <td className="py-2.5 font-mono text-[hsl(38,95%,55%)]">{f.type}</td>
                      <td className="py-2.5 text-[hsl(215,20%,55%)] text-[14px]">{f.example}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </SlideLayout>
  );
}
