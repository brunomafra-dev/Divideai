(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/invite/[token]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InviteTokenPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$invites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/invites.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function InviteTokenPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const token = String(params.token || '');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Processando convite...');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InviteTokenPage.useEffect": ()=>{
            const run = {
                "InviteTokenPage.useEffect.run": async ()=>{
                    setLoading(true);
                    try {
                        if (!token) {
                            setMessage('Convite invalido');
                            return;
                        }
                        const { data: invite, error: inviteError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('invite_tokens').select('group_id,expires_at').eq('token', token).single();
                        if (inviteError || !invite) {
                            setMessage('Convite invalido');
                            return;
                        }
                        if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
                            setMessage('Convite expirado');
                            return;
                        }
                        const { data: { session }, error: sessionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                        if (sessionError) {
                            console.error('invite.session-error', sessionError);
                            setMessage('Erro ao validar sessao');
                            return;
                        }
                        const user = session?.user ?? null;
                        if (!user) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$invites$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["savePendingInviteToken"])(token);
                            router.replace(`/signup?invite=${encodeURIComponent(token)}`);
                            return;
                        }
                        const { data: existingParticipant, error: existingParticipantError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('participants').select('id').eq('group_id', invite.group_id).eq('user_id', user.id).maybeSingle();
                        if (existingParticipantError) {
                            console.error('invite.participant-check-error', existingParticipantError);
                            setMessage('Erro ao validar participacao');
                            return;
                        }
                        if (!existingParticipant) {
                            const { error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('participants').insert({
                                group_id: invite.group_id,
                                user_id: user.id,
                                role: 'member'
                            });
                            if (insertError && insertError.code !== '23505') {
                                console.error('invite.participant-insert-error', insertError);
                                setMessage('Erro ao entrar no grupo');
                                return;
                            }
                        }
                        const { data: groupRow, error: groupError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from('groups').select('id').eq('id', invite.group_id).single();
                        if (groupError || !groupRow) {
                            console.error('invite.group-lookup-error', groupError);
                            setMessage('Grupo nao encontrado');
                            return;
                        }
                        router.replace(`/group/${invite.group_id}`);
                    } catch (error) {
                        console.error(error);
                        setMessage('Erro ao processar convite');
                    } finally{
                        setLoading(false);
                    }
                }
            }["InviteTokenPage.useEffect.run"];
            run();
        }
    }["InviteTokenPage.useEffect"], [
        router,
        token
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#F7F7F7] flex items-center justify-center px-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-md text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-700",
                children: loading ? 'Processando convite...' : message
            }, void 0, false, {
                fileName: "[project]/src/app/invite/[token]/page.tsx",
                lineNumber: 114,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/invite/[token]/page.tsx",
            lineNumber: 113,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/invite/[token]/page.tsx",
        lineNumber: 112,
        columnNumber: 5
    }, this);
}
_s(InviteTokenPage, "WHZCYj1sdUrV45sG9bgJgr+P8Kk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = InviteTokenPage;
var _c;
__turbopack_context__.k.register(_c, "InviteTokenPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_invite_%5Btoken%5D_page_tsx_6beec3c2._.js.map