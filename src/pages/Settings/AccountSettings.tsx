import React from 'react';
import { User, CreditCard, Package, Receipt } from 'lucide-react';

export default function AccountSettings() {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            Modifier
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Nom</span>
            <span className="text-gray-900 font-medium">Jean Dupont</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Email</span>
            <span className="text-gray-900 font-medium">jean.dupont@example.com</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Téléphone</span>
            <span className="text-gray-900 font-medium">+33 6 12 34 56 78</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Abonnement</h2>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium transition-colors">
            Mettre à niveau
          </button>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">Forfait Pro</span>
            <span className="text-blue-600 font-medium">29€/mois</span>
          </div>
          <p className="text-sm text-blue-600">Prochain renouvellement le 15 mai 2025</p>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Jusqu'à 1000 prospects
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Envoi illimité d'emails
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Support prioritaire
          </li>
        </ul>
      </div>

      {/* Payment Methods */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Méthodes de paiement</h2>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors">
            Ajouter
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Visa se terminant par 4242</div>
                <div className="text-sm text-gray-500">Expire en 03/2026</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Principal
            </span>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-medium text-gray-900">Historique de facturation</h2>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Facture #2024-001</div>
              <div className="text-sm text-gray-500">15 avril 2025</div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">29,00 €</span>
              <button className="text-blue-600 hover:text-blue-700">
                Télécharger
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Facture #2024-002</div>
              <div className="text-sm text-gray-500">15 mars 2025</div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-gray-900">29,00 €</span>
              <button className="text-blue-600 hover:text-blue-700">
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}