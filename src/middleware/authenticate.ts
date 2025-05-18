import passport from 'passport';

// Экспорт готового middleware
export const authenticate = passport.authenticate('jwt', { session: false });
