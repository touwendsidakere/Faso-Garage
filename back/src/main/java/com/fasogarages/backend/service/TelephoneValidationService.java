package com.fasogarages.backend.service;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import org.springframework.stereotype.Service;

@Service
public class TelephoneValidationService {

    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    /**
     * Valide un numéro de téléphone au format international
     * @param telephone Numéro avec indicatif (ex: +22670001111)
     * @return true si le numéro est valide
     * @throws RuntimeException si le numéro est invalide
     */
    public void validerNumero(String telephone) {
        if (telephone == null || telephone.trim().isEmpty()) {
            throw new RuntimeException("Le numéro de téléphone est obligatoire");
        }

        try {
            // Parser le numéro (le pays est détecté automatiquement via l'indicatif)
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            
            // Vérifier que le numéro est possible (longueur correcte pour le pays)
            if (!phoneUtil.isPossibleNumber(numero)) {
                throw new RuntimeException("Le numéro de téléphone n'est pas possible pour ce pays");
            }
            
            // Vérifier que le numéro est valide
            if (!phoneUtil.isValidNumber(numero)) {
                throw new RuntimeException("Le numéro de téléphone n'est pas valide");
            }
            
            // Vérifier que c'est un numéro mobile (optionnel)
            // if (!phoneUtil.getNumberType(numero).equals(PhoneNumberUtil.PhoneNumberType.MOBILE)) {
            //     throw new RuntimeException("Le numéro doit être un numéro de mobile");
            // }
            
        } catch (NumberParseException e) {
            throw new RuntimeException("Format de numéro de téléphone invalide. Utilisez le format international (+226XXXXXXXX)");
        }
    }

    /**
     * Récupère l'indicatif pays à partir d'un numéro
     */
    public int getIndicatifPays(String telephone) {
        try {
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            return numero.getCountryCode();
        } catch (NumberParseException e) {
            return 0;
        }
    }

    /**
     * Récupère le code ISO du pays (ex: BF, CI, FR, US)
     */
    public String getCodePays(String telephone) {
        try {
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            return phoneUtil.getRegionCodeForNumber(numero);
        } catch (NumberParseException e) {
            return null;
        }
    }

    /**
     * Formate un numéro en format international standard
     */
    public String formaterInternational(String telephone) {
        try {
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            return phoneUtil.format(numero, PhoneNumberUtil.PhoneNumberFormat.INTERNATIONAL);
        } catch (NumberParseException e) {
            throw new RuntimeException("Format de numéro invalide");
        }
    }

    /**
     * Formate un numéro en format E.164 (pour stockage en base)
     */
    public String formaterE164(String telephone) {
        try {
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            return phoneUtil.format(numero, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new RuntimeException("Format de numéro invalide");
        }
    }

    /**
     * Formate un numéro en format national
     */
    public String formaterNational(String telephone) {
        try {
            Phonenumber.PhoneNumber numero = phoneUtil.parse(telephone, null);
            return phoneUtil.format(numero, PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
        } catch (NumberParseException e) {
            throw new RuntimeException("Format de numéro invalide");
        }
    }
}