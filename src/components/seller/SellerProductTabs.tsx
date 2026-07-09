import { Layers3, ListChecks, Package, Shirt } from 'lucide-react';

export type ProductTab = 'categories' | 'products' | 'variants' | 'list';

interface SellerProductTabsProps {
  activeTab: ProductTab;
  onChangeTab: (tab: ProductTab) => void;
  categoriesCount: number;
  productsCount: number;
}

const tabs = [
  {
    key: 'categories' as ProductTab,
    label: 'Categorías',
    description: 'Crear y organizar categorías',
    icon: Layers3
  },
  {
    key: 'products' as ProductTab,
    label: 'Productos',
    description: 'Registrar productos nuevos',
    icon: Package
  },
  {
    key: 'variants' as ProductTab,
    label: 'Variantes',
    description: 'Tallas, colores y stock',
    icon: Shirt
  },
  {
    key: 'list' as ProductTab,
    label: 'Listado',
    description: 'Productos registrados',
    icon: ListChecks
  }
];

export function SellerProductTabs({
  activeTab,
  onChangeTab,
  categoriesCount,
  productsCount
}: SellerProductTabsProps) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        const count =
          tab.key === 'categories'
            ? categoriesCount
            : tab.key === 'list'
              ? productsCount
              : null;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChangeTab(tab.key)}
            className={`rounded-3xl border p-5 text-left transition ${
              isActive
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-2xl p-3 ${
                    isActive ? 'bg-white/10' : 'bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-bold">{tab.label}</h3>
                  <p className="mt-1 text-xs opacity-75">
                    {tab.description}
                  </p>
                </div>
              </div>

              {count !== null && (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    isActive
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {count}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}